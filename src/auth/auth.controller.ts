/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

interface JwtPayload {
  sub: string;
  email: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
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
    @Body() body: { email: string; password: string; name: string },
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
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldRefreshToken = req.cookies['refresh_token'];
    if (!oldRefreshToken) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ error: 'No refresh token' });
    }

    try {
      const userPayload = req.user as JwtPayload;
      const { accessToken, refreshToken } = await this.authService.refresh(
        userPayload?.sub,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    console.log('🍪 Cookies from request:', req.cookies);

    try {
      const userPayload = req.user as JwtPayload;
      await this.authService.revokeRefreshToken(userPayload.sub);

      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      return { message: 'logged_out' };
    } catch (err) {
      const message = (err as Error).message;
      console.error('Logout error:', message);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: message });
    }
  }
}
