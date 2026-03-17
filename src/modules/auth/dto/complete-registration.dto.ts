import { IsEmail, IsString, IsUUID, MinLength, Matches } from 'class-validator';

export class CompleteRegistrationDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsUUID('4', { message: 'Invalid registration session' })
  registrationToken: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password is too weak. Must include uppercase, lowercase, and a number or special character.',
  })
  password: string;
}
