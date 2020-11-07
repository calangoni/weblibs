import * as configs from '../configs.json';
import axios from 'axios';

export default {
  async sendMessage (message: string) {
    return Promise.all(configs.telegramChatIds.map(chatId =>
      axios.post(configs.telegramBotApi, {
        chat_id: chatId,
        text: message,
      })
    ))
  }
}
