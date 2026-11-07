import type {ContactChannelItem} from '@/types/bmsolar-api';
export function channelUrl(channel:ContactChannelItem):string{
 if(channel.actionUrl)return channel.actionUrl;
 if(channel.type==='phone')return 'tel:'+channel.target.replace(/[^+\d]/g,'');
 if(channel.type==='email')return 'mailto:'+channel.target;
 return channel.target;
}
