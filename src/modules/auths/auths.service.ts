import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { LoginDto, RegisterDto } from './auths.dto';
import { checkPassword, hashPassword } from 'src/helpers/bcrypt.helper';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(input: RegisterDto): Promise<{ access_token: string }> {
    try {
      const checkUser = await this.userModel.findOne({
        email: input.email,
      });
      if (checkUser)
        throw new UnprocessableEntityException('email has been registered!');

      const hash = await hashPassword(input.password);
      if (!hash)
        throw new UnprocessableEntityException('failed to hash password!');

      const user = new this.userModel({
        name: input.name,
        email: input.email,
        password: hash,
      });

      await user.save();

      const payload = { sub: user.id, role: user.user_type };
      const token = await this.jwtService.signAsync(payload);

      return {
        access_token: token,
      };
    } catch (e) {
      throw e;
    }
  }

  async login(input: LoginDto): Promise<{ access_token: string }> {
    try {
      console.log(input);
      const checkUser = await this.userModel.findOne({
        email: input.email,
      });
      if (!checkUser) throw new UnprocessableEntityException('user not found!');

      const isCorrect = await checkPassword(input.password, checkUser.password);
      if (!isCorrect) throw new UnauthorizedException('wrong credentials!');

      const payload = { sub: checkUser.id, role: checkUser.user_type };
      const token = await this.jwtService.signAsync(payload);

      return {
        access_token: token,
      };
    } catch (e) {
      throw e;
    }
  }
}
