import { Injectable } from '@nestjs/common';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminInitiateAuthCommand,
  AdminAddUserToGroupCommand,
  ConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import * as dotenv from 'dotenv';
import { jwtDecode } from 'jwt-decode';

dotenv.config();

@Injectable()
export class AuthService {
  private client = new CognitoIdentityProviderClient({
    region: process.env.COGNITO_REGION!,
  });

  async register(email: string, password: string, name: string, role: string = 'user') {
    if (role === 'admin') {
      throw new Error('Admin registration is not allowed through this endpoint');
    }

    // 1. Sign up with email and name
    const signUpCommand = new SignUpCommand({
      ClientId: process.env.COGNITO_USER_POOL_CLIENT_ID!,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'name',
          Value: name,
        },
      ],
    });

    await this.client.send(signUpCommand);

    // 2. Add user to group
    const addToGroupCommand = new AdminAddUserToGroupCommand({
      GroupName: role,
      Username: email,
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
    });

    await this.client.send(addToGroupCommand);

    return { message: 'User registered and added to group' };
  }

  async login(email: string, password: string) {
    const command = new AdminInitiateAuthCommand({
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      ClientId: process.env.COGNITO_USER_POOL_CLIENT_ID!,
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await this.client.send(command);

    const accessToken = response.AuthenticationResult?.AccessToken;
    const idToken = response.AuthenticationResult?.IdToken;

    if (!accessToken) throw new Error('Missing access token');

    const decoded: any = jwtDecode(accessToken);
    const groups = decoded['cognito:groups'] || [];

    return {
      accessToken,
      idToken,
      refreshToken: response.AuthenticationResult?.RefreshToken,
      expiresIn: response.AuthenticationResult?.ExpiresIn,
      tokenType: response.AuthenticationResult?.TokenType,
      role: groups[0] || 'user',
    };
  }

  async confirm(email: string, code: string) {
    const command = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_USER_POOL_CLIENT_ID!,
      Username: email,
      ConfirmationCode: code,
    });

    return this.client.send(command);
  }
}