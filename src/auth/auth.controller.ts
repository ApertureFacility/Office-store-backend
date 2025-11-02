import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBasicAuth,
} from '@nestjs/swagger';
import type { Response, Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayloadInterface } from 'src/interfaces/authInterfaces';

// DTO
export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto {
  email: string;
  password: string;
  name: string;
}

interface RequestWithUserAndCookies extends ExpressRequest {
  user: JwtPayloadInterface;
  cookies: Record<string, string>;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // --- LOGIN ---
  @Post('login')
  @ApiBasicAuth('basic-auth')
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({ status: 201, description: 'Успешный вход' })
  @ApiResponse({ status: 401, description: 'Неверные данные' })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { accessToken, refreshToken } = await this.authService.login(
        body.email,
        body.password,
      );

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { message: 'logged_in' };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Internal server error';
      throw new UnauthorizedException(message);
    }
  }

  // --- REGISTER ---
  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь зарегистрирован' })
  @ApiResponse({ status: 400, description: 'Ошибка регистрации' })
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { accessToken, refreshToken } =
        await this.authService.register(body);

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { message: 'registered' };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Internal server error';
      throw new UnauthorizedException(message);
    }
  }

  // --- REFRESH ---
  @Post('refresh')
  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiResponse({ status: 200, description: 'Токены обновлены' })
  async refresh(
    @Req() req: RequestWithUserAndCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldRefreshToken = req.cookies['refresh_token'];
    if (!oldRefreshToken) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ error: 'No refresh token' });
    }

    const userPayload = req.user;
    const { accessToken, refreshToken } = await this.authService.refresh(
      userPayload.sub,
      oldRefreshToken,
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'tokens_refreshed' };
  }

  // --- LOGOUT ---
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth() // <-- только тут Swagger будет просить токен
  @ApiOperation({ summary: 'Выход из системы' })
  async logout(
    @Req() req: RequestWithUserAndCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userPayload = req.user;
    await this.authService.revokeRefreshToken(userPayload.sub);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'logged_out' };
  }
}
