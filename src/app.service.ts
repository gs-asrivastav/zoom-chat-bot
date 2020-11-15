import { HttpService, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class AppService {
  private token: string;

  constructor(private httpService: HttpService) {
  }

  public getAuthURL(): string {
    // TODO: user state functionality can be improved
    return `https://app.zoom.us/oauth/authorize?response_type=code&client_id=${process.env.ZOOM_CLIENT_ID}&redirect_uri=${process.env.ZOOM_REDIRECT_URI}&state=userstate`;
  }

  public async getChatBotToken() {
    return this.httpService
      .post(
        `https://zoom.us/oauth/token?grant_type=client_credentials`,
        {},
        {
          headers: {
            Authorization: `Basic ${AppService.getEncodedClientCredentials()}`,
          },
        },
      )
      .pipe(
        map((response: AxiosResponse) => {
          return response.data;
        }),
        catchError((e: Error) => {
          console.error(e);
          throw new Error();
        }),
      )
      .toPromise();
  }

  public async sendMessage({ accountId, toJid }) {
    if (!this.token) {
      const generatedToken = await this.getChatBotToken();
      this.token = `${generatedToken.token_type} ${generatedToken.access_token}`;
    }
    return this.httpService
      .post(
        'https://api.zoom.us/v2/im/chat/messages',
        {
          robot_jid: process.env.ZOOM_CHATBOT_JID,
          to_jid: toJid,
          account_id: accountId,
          content: {
            head: {
              type: 'message',
              text: 'meeting with zoom',
            },
            body: [
              {
                type: 'section',
                sections: [
                  {
                    type: 'message',
                    style: {
                      bold: true,
                      color: '#000000',
                    },
                    text:
                      'Hello, this is a group. You can drag elments into this group container.',
                  },
                  {
                    type: 'attachments',
                    ext: 'jpg',
                    resource_url:
                      'https://d24cgw3uvb9a9h.cloudfront.net/static/93664/image/new/ZoomLogo.png',
                    information: {
                      title: {
                        style: {
                          color: '#323639',
                          itatic: false,
                          bold: false,
                        },
                        text: 'This is the title section',
                      },
                      description: {
                        style: {
                          color: '#2D8CFF',
                          bold: false,
                        },
                        text: 'this is an attachment example',
                      },
                    },
                  },
                ],
                footer: 'section footer',
                footer_icon:
                  'https://d24cgw3uvb9a9h.cloudfront.net/static/93664/image/new/ZoomLogo.png',
              },
            ],
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.token,
          },
        },
      )
      .pipe(
        map((response: AxiosResponse) => {
          return response.data;
        }),
        catchError((e: Error) => {
          console.error(e);
          throw new Error();
        }),
      )
      .toPromise();
  }

  private static getEncodedClientCredentials(): string {
    return Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`,
    ).toString('base64');
  }
}
