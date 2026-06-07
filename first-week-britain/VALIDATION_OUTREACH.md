# Validation Outreach Pack

Live site: https://first-week-britain.vercel.app

Primary test angle: 第一次去英国伦敦旅行，需要提前准备什么？

## UTM Links

Use one link per channel so GA4 can separate traffic sources.

```text
Xiaohongshu:
https://first-week-britain.vercel.app/?utm_source=xiaohongshu&utm_medium=social&utm_campaign=chinese_london_arrival_test

WeChat group:
https://first-week-britain.vercel.app/?utm_source=wechat&utm_medium=group&utm_campaign=chinese_london_arrival_test

Student society:
https://first-week-britain.vercel.app/?utm_source=student_society&utm_medium=community&utm_campaign=chinese_london_arrival_test

Reddit:
https://first-week-britain.vercel.app/?utm_source=reddit&utm_medium=community&utm_campaign=chinese_london_arrival_test

Direct friends/testers:
https://first-week-britain.vercel.app/?utm_source=direct_testers&utm_medium=dm&utm_campaign=chinese_london_arrival_test
```

## Chinese Post Copy

### Short Version

```text
第一次去英国/伦敦旅行，最容易出问题的不是景点，而是刚落地的第一天：网络、支付、机场到市区、地铁怎么刷卡、紧急电话、药店怎么问。

我做了一个免费的「英国第一周到达清单」小工具，选择国家、机场、旅行类型后，会生成落地后的实用 checklist。中国游客会看到专门的提示：英国支付、百度翻译设置、希思罗/盖特威克到伦敦、常用英文句子等。

想测试一下的可以点这里：
https://first-week-britain.vercel.app/?utm_source=xiaohongshu&utm_medium=social&utm_campaign=chinese_london_arrival_test

如果你觉得还缺什么，也欢迎告诉我。我会根据反馈继续改。
```

### Student Version

```text
准备来英国读书的新生，落地第一周通常会同时遇到很多小问题：手机卡、银行卡、交通、住宿地址、药店/NHS、学校报到、英文沟通。

我做了一个免费的 First Week in Britain 到达清单工具。选择 China + London + Student 后，会生成第一小时、机场到市区、第一晚、前三天的行动清单，还包括中国学生/游客常见的支付和翻译提醒。

测试链接：
https://first-week-britain.vercel.app/?utm_source=student_society&utm_medium=community&utm_campaign=chinese_london_arrival_test

欢迎反馈：你当时刚到英国最困惑的是什么？
```

### WeChat Group Version

```text
我做了一个给第一次来英国/伦敦的人用的小工具：First Week in Britain。

主要解决刚落地第一周的问题：
1. 手机网络/eSIM
2. 希思罗/盖特威克到伦敦
3. 英国 contactless 支付
4. 地铁/火车怎么刷卡
5. 999/111/药店怎么用
6. 百度翻译和常用英文句子

中国游客模式已经上线，想找几个人测试一下：
https://first-week-britain.vercel.app/?utm_source=wechat&utm_medium=group&utm_campaign=chinese_london_arrival_test

如果你觉得这个对新生/游客有用，或者哪里写得不清楚，麻烦直接告诉我。
```

## English Post Copy

```text
I’m testing a free arrival checklist for first-time UK visitors: First Week in Britain.

It helps with the practical first-day problems: mobile data, Heathrow/Gatwick transfers, contactless payments, London transport, NHS/emergency basics, etiquette, and phrase cards.

There is also a Chinese Visitor Mode for first-time visitors from China, including payment notes, Baidu Translate setup guidance, and bilingual phrase cards.

Test it here:
https://first-week-britain.vercel.app/?utm_source=reddit&utm_medium=community&utm_campaign=chinese_london_arrival_test

I’m looking for feedback from tourists, international students, and anyone who remembers what confused them when they first arrived in the UK.
```

## DM Script

```text
Hey, I’m testing a small free tool for first-time visitors arriving in Britain. It creates a practical first-week checklist for mobile data, payments, airport transfer, transport, emergency numbers, and phrases.

The first niche is Chinese visitors/students arriving in London. Could you try it on your phone and tell me if anything is confusing or missing?

https://first-week-britain.vercel.app/?utm_source=direct_testers&utm_medium=dm&utm_campaign=chinese_london_arrival_test
```

## Manual Phone Smoke Test

Before posting publicly, run this once on a real phone.

1. Open https://first-week-britain.vercel.app
2. Confirm the hero fits without horizontal scrolling.
3. Tap `Build my checklist`.
4. Set country to `China`.
5. Change trip length to `1`, then `2`, then `14`.
6. Generate checklist.
7. Confirm Chinese Visitor Mode appears.
8. Tap Baidu Translate link.
9. Copy a phrase card.
10. Submit a test waitlist email.
11. Confirm Formspree receives the submission.
12. Check GA4 Realtime for events.

## GA4 Events To Watch

- `hero_cta_clicked`
- `checklist_generated`
- `chinese_mode_enabled`
- `baidu_translate_clicked`
- `recommended_app_clicked`
- `phrase_copied`
- `waitlist_submit_success`
- `chinese_waitlist_submitted`

## Metrics For First 100-300 Visitors

Good early signs:

- 20%+ generate a checklist
- 5%+ join the waitlist
- Chinese visitors click payment, translation, airport, or phrase sections
- Users ask for `/zh`, full Chinese UI, student mode, Manchester, Edinburgh, Birmingham, or eSIM recommendations

Bad signs:

- Visitors bounce without generating a checklist
- People say the app is just a list of links
- Users do not understand what the product does in the first 10 seconds
- Waitlist conversion is below 2% after targeted traffic

## Feedback Questions

Ask testers these exact questions:

1. What would you still Google after using this?
2. Was anything wrong, confusing, or too long?
3. Which part felt most useful: payments, transport, translation, emergency, phrases, or airport route?
4. Would you send this to someone visiting the UK for the first time?
5. What should be added next: full Chinese UI, student mode, more airports, eSIM links, or offline checklist?
