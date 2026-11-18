/* eslint-disable no-console */
// 휴대폰 푸시 알림용 VAPID 키를 만든다. 나온 두 줄을 .env 에 붙여 넣고 서버를 다시 켜면 된다.
// 한 번 정한 키는 바꾸지 마세요. 바꾸면 이미 알림을 켠 기기들이 다시 켜야 해요.
import webpush from 'web-push';

const { publicKey, privateKey } = webpush.generateVAPIDKeys();
console.log('아래 두 줄을 .env 에 넣으세요 (Docker 는 맨 위 .env, 개발용은 backend/.env).\n');
console.log(`VAPID_PUBLIC_KEY=${publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${privateKey}`);
