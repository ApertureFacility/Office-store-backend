import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../prisma/prisma.service';

interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
}

describe('Reviews e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authCookies: string[];
  let testProductId: string;

  const plainPassword = 'hashedpassword'; // пароль тестового пользователя

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    // Создаём тестовую категорию
    const category = await prisma.category.upsert({
      where: { id: '1c1c1c1c-1111-1111-1111-111111111111' },
      update: {},
      create: {
        id: '1c1c1c1c-1111-1111-1111-111111111111',
        name: 'Electronics',
        urlKey: 'electronics',
      },
    });

    // Создаём тестового поставщика
    const supplier = await prisma.supplier.upsert({
      where: { id: '2d2d2d2d-2222-2222-2222-222222222222' },
      update: {},
      create: {
        id: '2d2d2d2d-2222-2222-2222-222222222222',
        name: 'Test Supplier',
        email: 'supplier@test.com',
        phone: '+123456789',
        address: '123 Test St',
      },
    });

    // Создаём тестовый продукт
    const product = await prisma.product.upsert({
      where: { urlKey: 'test-product' },
      update: {},
      create: {
        title: 'Test Product',
        urlKey: 'test-product',
        description: 'Test product description',
        price: 999.99,
        stock: 10,
        categoryId: category.id,
        supplierId: supplier.id,
      },
    });
    testProductId = product.id;

    // Создаём тестового пользователя
    await prisma.user.upsert({
      where: { email: 'testuser@example.com' },
      update: {},
      create: { email: 'testuser@example.com', passwordHash: plainPassword },
    });

    // Логинимся и получаем cookie
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'testuser@example.com', password: plainPassword })
      .expect(200);

    authCookies = loginRes.headers['set-cookie'];
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a review', async () => {
    const res = await request(app.getHttpServer())
      .post('/reviews')
      .set('Cookie', authCookies) // <- используем cookie
      .send({
        productId: testProductId,
        rating: 5,
        comment: 'Excellent product!',
      })
      .expect(201);

    const review: Review = res.body;
    expect(review).toHaveProperty('id');
    expect(review.comment).toBe('Excellent product!');
  });

  it('should get reviews for a product', async () => {
    const res = await request(app.getHttpServer())
      .get(`/reviews/product/${testProductId}`)
      .set('Cookie', authCookies) // <- cookie для аутентификации
      .expect(200);

    const reviews: Review[] = res.body;
    expect(reviews.length).toBeGreaterThanOrEqual(1);
    expect(reviews[0].comment).toBe('Excellent product!');
  });
});
