import { IsEmail, IsNotEmpty } from 'class-validator';

export class InitiateRegistrationDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;
}
