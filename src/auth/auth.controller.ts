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
import type { Response, Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayloadInterface } from 'src/interfaces/authInterfaces';

// DTO для логина и регистрации
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
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
        maxAge: 15 * 60 * 1000, // 15 минут
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      });

      return { message: 'logged_in' };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Internal server error';
      return res
        .status(
          err instanceof UnauthorizedException
            ? HttpStatus.UNAUTHORIZED
            : HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json({ error: message });
    }
  }

  @Post('register')
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
      return res
        .status(
          err instanceof UnauthorizedException
            ? HttpStatus.BAD_REQUEST
            : HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json({ error: message });
    }
  }

  @Post('refresh')
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

    try {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unauthorized';
      return res.status(HttpStatus.UNAUTHORIZED).json({ error: message });
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(
    @Req() req: RequestWithUserAndCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const userPayload = req.user;
      await this.authService.revokeRefreshToken(userPayload.sub);

      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      return { message: 'logged_out' };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Internal server error';
      console.error('Logout error:', message);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: message });
    }
  }
}
