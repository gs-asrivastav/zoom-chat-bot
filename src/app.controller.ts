import { Body, Controller, Get, Post, Query, Redirect } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get('/status')
  status(): any {
    return {
      status: 'OK',
    };
  }

  @Get()
  @Redirect()
  chatbot(@Query() queryParams) {
    // We wil receive auth code + state that was sent
    // it can be used to store refresh tokens
    console.info(queryParams);
    // Open chat in zoom application/browser
    return {
      url: `https://app.zoom.us/launch/chat?jid=${process.env.ZOOM_CHATBOT_JID}`,
    };
  }

  @Get('oauth/authorize')
  @Redirect()
  authorize(): any {
    // Redirection to OAuth Verification for offline token access
    return {
      url: this.appService.getAuthURL(),
    };
  }

  @Post('api')
  async apiCommands(@Body() data: any) {
    await this.appService.sendMessage({ ...data.payload });
    return {
      status: 'OK',
    };
  }

  @Post('events/callback')
  callback(@Body() body) {
    console.info(JSON.stringify(body));
    return {};
  }
}
