import { Test } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

const mockUsersRepository = () => ({
  createUser: jest.fn(),
  findOneBy: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

const mockCredentials: AuthCredentialsDto = {
  username: 'test',
  password: 'somePass',
};

const mockToken = 'testToken';

const mockUser: User = {
  username: 'John',
  id: 'someId',
  password: '$2a$10$zQDdN1J5GKgB./j7dpDZD.nf8jwmMQecYVFBTtBxUoXXPnQHa2FP2',
  tasks: [],
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository;
  let jwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useFactory: mockUsersRepository },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersRepository = module.get(UsersRepository);
    jwtService = module.get(JwtService);
  });

  describe('signUp', () => {
    it('calls UsersRepository.createUser', async () => {
      usersRepository.createUser.mockResolvedValue();
      await authService.signUp(mockCredentials);
      expect(usersRepository.createUser).toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('calls UsersRepository.findOneBy, JwtService.sign and returns the result', async () => {
      usersRepository.findOneBy.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue(mockToken);
      const result = await authService.signIn(mockCredentials);
      await expect(result).toEqual({ accessToken: mockToken });
    });

    it('calls UsersRepository.findOneBy and handles an error', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);
      await expect(authService.signIn(mockCredentials)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });
});
