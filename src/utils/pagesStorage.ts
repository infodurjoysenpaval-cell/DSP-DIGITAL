import { PolicyPage } from '../types';

const PAGES_STORAGE_KEY = 'dsp_custom_pages';

export const DEFAULT_PAGES: Record<string, PolicyPage> = {
  refund: {
    id: 'page-refund',
    key: 'refund',
    title: 'Return & Refund Policy',
    titleBn: 'রিটার্ন ও রিফান্ড পলিসি',
    lastUpdated: '2026-09-20',
    summary: 'Our 100% replacement and money-back guarantee for digital licenses and software keys.',
    summaryBn: 'ডিজিটাল সফটওয়্যার লাইসেন্স ও কি-এর জন্য আমাদের ১০০% রিপ্লেসমেন্ট এবং মানি-ব্যাক গ্যারান্টি।',
    content: `At DSP DIGITAL MART, we are committed to delivering 100% genuine and fully functional digital products, software licenses, and subscription accounts.

1. 100% Genuine Product Guarantee:
Every key or account is guaranteed to be 100% genuine, original, and fully functional upon delivery.

2. Replacement & Refund Eligibility:
Due to the nature of digital keys, sales are generally final once delivered. However, you are fully covered for a replacement or 100% money-back refund under the following conditions:
• The delivered license key or credential fails activation upon initial receipt.
• Our technical support team is unable to resolve or replace the key within 1-2 hours.
• An item is temporarily out of stock and immediate electronic fulfillment is delayed.

3. How to Claim a Refund:
Simply message your Order ID and a screenshot of the activation error to our WhatsApp support (+8801712792184) or email. Our agent will verify the key and process the refund immediately.

4. Refund Processing Time:
Approved refunds are disbursed to your original payment channel (bKash, Nagad, Rocket, or Bank Account) within 24 to 48 hours without unnecessary deductions.`,
    contentBn: `DSP DIGITAL MART-এ আমরা অত্যন্ত বিশ্বস্ততার সাথে ১০০০+ ডিজিটাল সফটওয়্যার লাইসেন্স, ডিজাইন টুলস ও সাবস্ক্রিপশন ডেলিভারি দিয়ে আসছি। আমরা প্রতিটি প্রোডাক্টের জন্য শতভাগ কার্যকারিতার নিশ্চয়তা প্রদান করি।

১. ১০০% অরিজিনাল প্রোডাক্ট গ্যারান্টি:
আমাদের প্রতিটি সফটওয়্যার কি এবং প্রোডাক্ট এক্সেস সম্পূর্ণ অফিশিয়াল সোর্স থেকে সংগৃহীত এবং শতভাগ জেনুইন।

২. রিফান্ড ও রিপ্লেসমেন্ট যোগ্যতা:
যেহেতু এগুলো ডিজিটাল প্রোডাক্ট, তাই সাধারণত ডেলিভারির পর রিফান্ড দেওয়া হয় না। তবে নিচের যেকোনো একটি ক্ষেত্রে আপনি ১০০% রিপ্লেসমেন্ট বা রিফান্ড পাবেন:
• প্রদত্ত লাইসেন্স কি বা একাউন্ট ডেলিভারির সময় নিষ্ক্রিয় (Invalid) থাকলে।
• আমাদের সাপোর্ট টিম ১-২ ঘণ্টার মধ্যে কি রিপ্লেস বা সচল করে দিতে ব্যর্থ হলে।
• স্টকে প্রোডাক্ট না থাকার কারণে তাৎক্ষণিক ডেলিভারি দেওয়া সম্ভব না হলে।

৩. রিফান্ড পাওয়ার নিয়ম:
আপনার অর্ডার আইডি এবং সমস্যায় পাওয়া এরর স্ক্রিনশটটি সরাসরি আমাদের হোয়াটসঅ্যাপ নম্বরে (+৮৮০১৭১২৭৯২১৮৪) পাঠালেই আমাদের টিম দ্রুত যাচাই করে রিফান্ড প্রসেস করবে।

৪. রিফান্ড প্রসেসিং সময়:
রিফান্ড রিকুয়েস্ট অ্যাপ্রুভ হওয়ার পর ২৪ থেকে ৪৮ ঘণ্টার মধ্যে আপনার মূল পেমেন্ট মাধ্যমে (বিকাশ/নগদ/রকেট/ব্যাংক) টাকা ফেরত পাঠানো হয়।`,
    highlights: [
      '100% genuine license guarantee',
      'Instant replacement within 1–2 hours if key invalid',
      'No hassle 24–48 hours refund via bKash/Nagad'
    ],
    highlightsBn: [
      '১০০% জেনুইন লাইসেন্স গ্যারান্টি',
      'কি নিষ্ক্রিয় হলে ১-২ ঘণ্টার মধ্যে ইনস্ট্যান্ট রিপ্লেসমেন্ট',
      'বিকাশ/নগদে ২৪-৪৮ ঘণ্টার মধ্যে দ্রুত রিফান্ড'
    ],
    isPublished: true,
  },
  privacy: {
    id: 'page-privacy',
    key: 'privacy',
    title: 'Privacy Policy',
    titleBn: 'প্রাইভেসি পলিসি',
    lastUpdated: '2026-09-20',
    summary: 'How we safeguard customer information, payment details, and digital communication.',
    summaryBn: 'আমরা কীভাবে গ্রাহকের তথ্য, পেমেন্ট ডিটেইলস এবং ডিজিটাল ডাটা সুরক্ষিত রাখি।',
    content: `Your privacy and data security are our top priorities at DSP DIGITAL MART. We strictly safeguard all customer information collected during order placement and checkout.

1. Information We Collect:
We collect personal information that you voluntarily provide when placing an order, creating an account, or requesting customer support — including your name, email address, phone number, order notes, and support communications.

2. Payment Data Security:
Payments are safely processed via official, encrypted payment gateways including bKash, Nagad, Rocket, or direct bank transfer. Sensitive financial credentials such as PINs or passwords are processed strictly on secure gateway pages and are never saved on our databases.

3. How We Use Your Data:
Your information is exclusively used to fulfill digital product orders, issue licenses, maintain your account dashboard, and provide lifetime warranty support.
• Instant delivery of license keys to your WhatsApp and Email.
• Order confirmation and status updates.
• Subscription renewal reminders before expiration.

4. Data Confidentiality:
We adhere to strict privacy rules. Your personal details will never be sold, rented, or distributed to any third parties under any circumstances.`,
    contentBn: `অর্ডার, অ্যাকাউন্ট বা সাপোর্টের জন্য আপনি যে তথ্য দেন, যেমন নাম, ইমেইল, ফোন নম্বর ও অর্ডার ডিটেইলস আমরা সর্বোচ্চ নিরাপত্তাসহ সংরক্ষণ করি।

১. আমরা যেসব তথ্য সংগ্রহ করি:
অর্ডার সম্পন্ন করা, ডিজিটাল লাইসেন্স প্রদান করা বা অ্যাকাউন্ট তৈরির সুবিধার্থে আপনার নাম, ইমেইল নম্বর, মোবাইল নম্বর ও অর্ডার সংক্রান্ত তথ্য সংগ্রহ করা হয়।

২. পেমেন্ট তথ্য সুরক্ষা:
আমরা বিকাশ, নগদ, রকেট সহ ভেরিফায়েড পেমেন্ট গেটওয়ে ব্যবহার করি। পেমেন্ট করার সময় কার্ড, ব্যাংক বা মোবাইল ফিন্যান্সিয়াল সার্ভিস সংক্রান্ত তথ্য নিরাপদ পেজে প্রসেস হয়। আপনার কোনো ব্যক্তিগত গোপন তথ্য বা পিন আমাদের সার্ভারে সংরক্ষণ করা হয় না।

৩. তথ্য যেভাবে ব্যবহার করা হয়:
সংগৃহীত তথ্য শুধুমাত্র আপনার অর্ডার সম্পন্ন করা, ডিজিটাল লাইসেন্স বা সাবস্ক্রিপশন ডেলিভারি দেওয়া, কাস্টমার একাউন্ট পরিচালনা এবং বিক্রয় পরবর্তী ওয়ারেন্টি ও সাপোর্ট নিশ্চিত করতে ব্যবহার করা হয়।
• আপনার হোয়াটসঅ্যাপ বা ইমেইলে সরাসরি প্রোডাক্ট অ্যাক্সেস পাঠানো।
• অর্ডারের আপডেট এবং ভেরিফিকেশন কোড পাঠানো।
• লাইসেন্স এর মেয়াদ শেষ হওয়ার আগে রিমাইন্ডার দেওয়া।

৪. তথ্য সুরক্ষা ও গোপনীয়তা:
আমরা আপনার কোনো ব্যক্তিগত তথ্য (নাম, ফোন নম্বর, ইমেইল) কোনো তৃতীয় পক্ষের কাছে বিক্রি, ভাড়া বা শেয়ার করি না। সকল ডেটা সর্বোচ্চ নিরাপত্তাসহ সংকেতায়িত (Encrypted) সার্ভারে সংরক্ষিত থাকে।`,
    highlights: [
      'Zero third-party data sharing',
      'Encrypted transaction records',
      'Full privacy guarantee for customer accounts'
    ],
    highlightsBn: [
      'কোনো তৃতীয় পক্ষের সাথে ডাটা শেয়ার করা হয় না',
      'এনক্রিপ্টেড পেমেন্ট রেকর্ডস',
      'কাস্টমার অ্যাকাউন্টের সম্পূর্ণ গোপনীয়তা নিশ্চায়ন'
    ],
    isPublished: true,
  },
  terms: {
    id: 'page-terms',
    key: 'terms',
    title: 'Terms and Conditions',
    titleBn: 'টার্মস অ্যান্ড কন্ডিশনস',
    lastUpdated: '2026-09-20',
    summary: 'Standard service rules, usage limits, and warranty conditions for digital goods.',
    summaryBn: 'ডিজিটাল প্রোডাক্টের সেবা ব্যবহার, ডিভাইস সীমা এবং ওয়ারেন্টির সাধারণ শর্তাবলী।',
    content: `Welcome to DSP DIGITAL MART. By placing an order on our platform, you agree to comply with our service terms:

1. Acceptance of Terms:
By purchasing software licenses or digital services on DSP DIGITAL MART, you agree to abide by our platform guidelines. All licenses distributed are legitimate and legally obtained from official sources.

2. Digital License Fulfillment:
All purchases are fulfilled electronically. License credentials and access instructions are delivered to your WhatsApp, Email, and account order history within 5 to 30 minutes of payment verification.

3. Device & Credential Usage Rules:
License keys must strictly be activated on the allowed number of devices as stated in the product description. Altering email or passwords on shared subscriptions will instantly void warranty support.

4. Warranty Support Duration:
Full replacement and technical troubleshooting support is guaranteed throughout the active duration of your subscription plan.`,
    contentBn: `ডিএসপি ডিজিটাল মার্টে যেকোনো প্রোডাক্ট অর্ডার করার মাধ্যমে আপনি আমাদের শর্তাবলীতে সম্মতি প্রদান করছেন।

১. সেবা ব্যবহারের শর্তাবলী:
আমাদের প্ল্যাটফর্ম থেকে সফটওয়্যার লাইসেন্স কেনাকাটা করার ক্ষেত্রে ইউজার সার্ভিস গাইডলাইন মেনে চলতে হবে। আমাদের সকল প্রোডাক্ট শতভাগ লিগ্যাল ও অরিজিনাল অফিশিয়াল সোর্স থেকে সংগৃহীত।

২. ডিজিটাল ডেলিভারি নীতি:
আমাদের সকল লাইসেন্স কি ও সাবস্ক্রিপশন ডিজিটাল মিডিয়ায় ইলেকট্রনিকভাবে ডেলিভারি করা হয়। পেমেন্ট সম্পন্ন হওয়ার ৫ থেকে ৩০ মিনিটের মধ্যে আপনার হোয়াটসঅ্যাপ, ইমেইল এবং ড্যাশবোর্ডে প্রোডাক্ট পাওয়া যাবে।

৩. ডিভাইস লিমিট ও পাসওয়ার্ড নীতি:
প্রোডাক্ট ডিসক্রিপশনে উল্লেখিত ডিভাইস সংখ্যার বেশি ডিভাইসে একই কি ব্যবহার করা যাবে না। শেয়ার্ড সাবস্ক্রিপশন একাউন্টের পাসওয়ার্ড বা ইমেইল পরিবর্তন করা কঠোরভাবে নিষিদ্ধ, তা করলে ওয়ারেন্টি বাতিল গণ্য হবে।

৪. ওয়ারেন্টি মেয়াদে সাপোর্ট:
ক্রয়কৃত মেয়াদের শেষ দিন পর্যন্ত আমাদের সাপোর্ট টিম যেকোনো সমস্যা সমাধানে ২৪/৭ পাশে থাকবে।`,
    highlights: [
      'Instant electronic delivery',
      'Device limits must be respected',
      'Lifetime or full advertised warranty support'
    ],
    highlightsBn: [
      'ইনস্ট্যান্ট ইলেকট্রনিক ডেলিভারি',
      'নির্দিষ্ট ডিভাইস সীমা মানতে হবে',
      'সম্পূর্ণ মেয়াদের জন্য ওয়ারেন্টি ব্যাকআপ'
    ],
    isPublished: true,
  },
  about: {
    id: 'page-about',
    key: 'about',
    title: 'About Us',
    titleBn: 'আমাদের সম্পর্কে',
    lastUpdated: '2026-09-20',
    summary: 'Bangladesh’s premier destination for genuine digital products and software licenses.',
    summaryBn: 'জেনুইন ডিজিটাল প্রোডাক্ট ও সফটওয়্যার লাইসেন্সের বিশ্বস্ত অনলাইন প্ল্যাটফর্ম।',
    content: `DSP DIGITAL MART is Bangladesh's premier and trusted online destination for authentic software licenses, creative design tools, streaming passes, antivirus protection, and premium digital subscriptions.

1. Who We Are:
DSP DIGITAL MART is Bangladesh’s trusted store for authentic software licenses, creative suite subscriptions, streaming passes, antivirus software, and premium mobile utilities.

2. Our Core Mission:
To empower freelancers, students, developers, agency owners, and digital creators across Bangladesh with original digital tools at unbeatable local prices backed by reliable 24/7 support.

3. Why Choose DSP DIGITAL MART?
• 10,000+ Happy Customers with verified reputation and stellar customer satisfaction.
• Rapid Fulfillment with digital keys dispatched within minutes.

4. Official Contact Details:
Location: Khulna, Bangladesh
Hotline / WhatsApp: +8801712792184
Email: dspdigitalmart@gmail.com`,
    contentBn: `DSP DIGITAL MART হলো বাংলাদেশের অন্যতম বিশ্বস্ত অনলাইন প্রিমিয়াম ডিজিটাল সফটওয়্যার ও সার্ভিস প্রদানকারী প্রতিষ্ঠান।

১. ডিএসপি ডিজিটাল মার্ট পরিচিতি:
আমরা অরিজিনাল সফটওয়্যার লাইসেন্স কি, মোবাইল অ্যাপ সাবস্ক্রিপশন, ডিজাইন টুলস ও গ্রাফিক্স প্যাক সাশ্রয়ী মূল্যে প্রদান করি।

২. আমাদের লক্ষ্য ও উদ্দেশ্য:
বাংলাদেশের শিক্ষার্থী, ফ্রিল্যান্সার, কন্টেন্ট ক্রিয়েটর, প্রযুক্তিপ্রেমী ও আইটি পেশাজীবীদের জন্য সাশ্রয়ী মূল্যে জেনুইন অফিশিয়াল সফটওয়্যার এক্সেস সুনিশ্চিত করা এবং ২৪/৭ মানবিক কাস্টমার সাপোর্ট দেওয়া।

৩. কেন আমরা সেরা?
• ১০,০০০+ হ্যাপি কাস্টমার যাদের আমরা দীর্ঘদিন ধরে বিশ্বস্ততার সাথে সেবা দিয়ে আসছি।
• ইনস্ট্যান্ট ডেলিভারি সার্ভিস যার মাধ্যমে অর্ডার করার মাত্র কয়েক মিনিটের মধ্যেই প্রোডাক্ট পাওয়া যায়।

৪. যোগাযোগ ও অফিশিয়াল ঠিকানা:
📍 ঠিকানা: খুলনা, বাংলাদেশ
📞 হটলাইন: +৮৮০১৭১২৭৯২১৮৪
✉️ ইমেইল: dspdigitalmart@gmail.com`,
    highlights: [
      'Authentic software at affordable BD rates',
      'Fast automated delivery to WhatsApp and Email',
      'Dedicated helpline: +8801712792184'
    ],
    highlightsBn: [
      'সাশ্রয়ী বিডি রেটে অরিজিনাল সফটওয়্যার',
      'হোয়াটসঅ্যাপ ও ইমেইলে দ্রুত ডেলিভারি',
      'ডেডিকেটেড হটলাইন: +৮৮০১৭১২৭৯২১৮৪'
    ],
    isPublished: true,
  },
  'why-shop': {
    id: 'page-why-shop',
    key: 'why-shop',
    title: 'Why Shop Online with Us',
    titleBn: 'কেন আমাদের থেকে কিনবেন',
    lastUpdated: '2026-09-20',
    summary: 'The DSP Digital Mart advantage: genuine licenses, instant delivery, and local support.',
    summaryBn: 'কেনাকাটার বিশেষ সুবিধাসমূহ: আসল লাইসেন্স, ইনস্ট্যান্ট ডেলিভারি ও লোকাল সাপোর্ট।',
    content: `Shopping with DSP DIGITAL MART guarantees authentic software, zero risk, and complete peace of mind:

1. 100% Genuine & Official Keys:
We strictly forbid cracked or illegal software. Every key, activation code, or subscription credential provided is 100% genuine and legally sourced from official providers.

2. Lightning-Fast Delivery:
No long waiting hours! Once your payment is verified, your digital keys are dispatched straight to your WhatsApp and Email address within 5 to 15 minutes.

3. Convenient Local BD Payments:
No international credit card required! Seamlessly complete purchases using bKash, Nagad, Rocket, or direct Bank Transfer in Bangladeshi Taka.

4. Dedicated 24/7 Human Support:
If you face activation hiccups, our support agents respond quickly on WhatsApp and can even provide remote desktop installation assistance via AnyDesk or TeamViewer.`,
    contentBn: `DSP DIGITAL MART-এ কেনাকাটা করলে আপনি পাচ্ছেন আসল প্রোডাক্ট, জিরো রিক্স এবং ১০০% মানসিক শান্তি:

১. ১০০% আসল ও অফিশিয়াল লাইসেন্স:
আমরা কোনো প্রকার পাইরেটেড বা ক্র্যাক সফটওয়্যার প্রদান করি না। আমাদের প্রতিটি সফটওয়্যার কি এবং প্রোডাক্ট এক্সেস সম্পূর্ণ অফিশিয়াল সোর্স থেকে সংগৃহীত।

২. লাইটিং ফাস্ট ডিজিটাল ডেলিভারি:
অর্ডার ও পেমেন্ট সম্পন্ন করার পর আপনাকে ঘণ্টার পর ঘণ্টা অপেক্ষা করতে হবে না। সাধারণত ৫ থেকে ১৫ মিনিটের মধ্যেই আপনার হোয়াটসঅ্যাপ ও ইমেইলে প্রোডাক্ট পৌঁছে যায়।

৩. সহজ লোকাল পেমেন্ট (বিকাশ/নগদ/রকেট):
আন্তর্জাতিক মাস্টারকার্ডের ঝামেলা ছাড়াই বাংলাদেশের যেকোনো স্থান থেকে বিকাশ, নগদ বা রকেটের মাধ্যমে টাকা পরিশোধ করে অর্ডার কনফার্ম করতে পারবেন।

৪. ২৪/৭ মানবিক কাস্টমার সাপোর্ট:
অ্যাক্টিভেশন বা সেটআপে কোনো সমস্যা হলে আমাদের সাপোর্ট টিম হোয়াটসঅ্যাপে সবসময় প্রস্তুত থাকে। প্রয়োজন হলে AnyDesk / TeamViewer দিয়ে সরাসরি সাহায্য করা হয়।`,
    highlights: [
      '100% Official Genuine Licenses',
      'Instant 5-Minute Delivery',
      'Localized bKash & Nagad payments',
      'AnyDesk Remote Setup Assistance'
    ],
    highlightsBn: [
      '১০০% অফিশিয়াল জেনুইন লাইসেন্স',
      'ইনস্ট্যান্ট ৫ মিনিটে ডেলিভারি',
      'সহজ বিকাশ ও নগদ পেমেন্ট',
      'এনিডেস্কে রিমোট ইন্সটলেশন সাপোর্ট'
    ],
    isPublished: true,
  },
  faq: {
    id: 'page-faq',
    key: 'faq',
    title: 'Frequently Asked Questions (FAQ)',
    titleBn: 'সাধারণ প্রশ্ন ও উত্তর (FAQ)',
    lastUpdated: '2026-09-20',
    summary: 'Answers to the most common questions about ordering, delivery, and payments.',
    summaryBn: 'অর্ডার, ডেলিভারি এবং পেমেন্ট সংক্রান্ত সাধারণ প্রশ্নের সহজ উত্তর।',
    content: `Here are answers to the most common questions from our valued customers:

1. How do I receive my product after making a payment?
Within 5 to 30 minutes of payment confirmation, your license key or account credentials will be sent directly to your WhatsApp, Email, and user dashboard.

2. Are these software keys 100% original and official?
Yes! All our software licenses and subscriptions are 100% authentic, legal, and covered by our replacement warranty.

3. What should I do if I encounter an activation issue?
Simply drop a message with your Order ID and error screenshot to our WhatsApp helpline (+8801712792184). Our support agent will assist or issue a replacement immediately.

4. Can I use one key on multiple devices?
License keys must strictly be used on the allowed number of devices specified in the product description.`,
    contentBn: `গ্রাহকদের সাধারণ প্রশ্নসমূহের বিস্তারিত উত্তর দেওয়া হলো:

১. পেমেন্ট করার পর আমি কীভাবে লাইসেন্স কি পাব?
পেমেন্ট সফল হওয়ার ৫ থেকে ৩০ মিনিটের মধ্যে আপনার দেওয়া হোয়াটসঅ্যাপ নম্বর, ইমেইল এবং আমাদের ওয়েবসাইটের অ্যাকাউন্ট ড্যাশবোর্ডে প্রোডাক্ট অ্যাক্সেস কি পেয়ে যাবেন।

২. আপনাদের সফটওয়্যার কিগুলো কি ১০০% অরিজিনাল?
হ্যাঁ, আমাদের প্রতিটি প্রোডাক্ট শতভাগ জেনুইন, অফিশিয়াল এবং ফুল ওয়ারেন্টিযুক্ত।

৩. অ্যাক্টিভেশনে সমস্যা হলে আমি কার সাথে যোগাযোগ করব?
সরাসরি আমাদের হোয়াটসঅ্যাপ নম্বরে (+৮৮০১৭১২৭৯২১৮৪) মেসেজ দিন। আমাদের কাস্টমার সাপোর্ট এজেন্ট সাথে সাথে আপনাকে গাইড করবে।

৪. আমি কি একাধিক ডিভাইসে একটি কি ব্যবহার করতে পারব?
প্রোডাক্ট ডিসক্রিপশনে উল্লেখিত নির্দিষ্ট সংখ্যক ডিভাইসেই কেবল লাইসেন্স একটিভ করা যাবে।`,
    highlights: [
      'Immediate delivery to WhatsApp and Email',
      'Replacement warranty for every valid order',
      'Dedicated helpline: +8801712792184'
    ],
    highlightsBn: [
      'হোয়াটসঅ্যাপ ও ইমেইলে দ্রুত ডেলিভারি',
      'প্রতিটি অর্ডারে রিপ্লেসমেন্ট ওয়ারেন্টি',
      'হটলাইন সাপোর্ট: +৮৮০১৭১২৭৯২১৮৪'
    ],
    isPublished: true,
  },
  support: {
    id: 'page-support',
    key: 'support',
    title: 'After Sales Support',
    titleBn: 'বিক্রয় পরবর্তী সাপোর্ট',
    lastUpdated: '2026-09-20',
    summary: 'Comprehensive warranty, installation help, and ongoing customer assistance.',
    summaryBn: 'ইনস্টলেশন সহায়তা, ওয়ারেন্টি সুবিধা ও কাস্টমার কেয়ার হেল্প।',
    content: `Our relationship doesn't end when you complete your purchase! We provide lifetime customer guidance and full warranty backing for all our products:

1. Step-by-Step Setup Guides:
Every product comes with clear screenshot and video tutorials to help you activate your license in under two minutes.

2. Remote Desktop Technical Assistance:
Facing an activation error? Our technical specialists can connect via AnyDesk or TeamViewer to assist directly on your device.

3. 1:1 Replacement Guarantee:
Full replacement guarantee covers your entire active subscription duration for uninterrupted software experience.

4. Proactive Renewal Notifications:
We send friendly renewal alerts prior to expiration so your creative projects and workflow are never disrupted.`,
    contentBn: `ক্রয় সম্পন্ন করার পর আমাদের দায়িত্ব শেষ হয়ে যায় না। আপনার সফটওয়্যার ব্যবহারে যেকোনো সহায়তায় আমরা পাশে আছি:

১. ইনস্টলেশন ও এক্টিভেশন গাইড:
প্রোডাক্ট কেনার সাথে সাথে আমরা বিস্তারিত ছবি ও ভিডিও গাইড প্রদান করি যাতে আপনি নিজে নিজেই খুব সহজে সফটওয়্যার বা সাবস্ক্রিপশন চালু করতে পারেন।

২. রিমোট ডেস্কে সরাসরি সাহায্য:
এক্টিভেশন করতে কোনো সমস্যা হলে চিন্তার কোনো কারণ নেই। আমাদের আইটি এক্সপার্ট টিম AnyDesk বা TeamViewer এর মাধ্যমে সরাসরি আপনার স্ক্রিনে সাহায্য করে দেবে।

৩. ওয়ারেন্টি মেয়াদে ১:১ রিপ্লেসমেন্ট:
সাবস্ক্রিপশনের সম্পূর্ণ মেয়াদ জুড়ে যদি কোনো সাময়িক বিভ্রাট ঘটে, আমাদের সাপোর্ট টিম দ্রুত নতুন কি বা অ্যাক্সেস দিয়ে তা সমাধান করে দেয়।

৪. মেয়াদ শেষের রিমাইন্ডার:
আপনার সাবস্ক্রিপশনের মেয়াদ শেষ হওয়ার কয়েকদিন আগেই আপনাকে জানানো হবে যাতে আপনার জরুরি কাজ বন্ধ না হয়ে যায়।`,
    highlights: [
      'Free AnyDesk Remote Installation Support',
      'Fast response on WhatsApp: +8801712792184',
      'Full replacement warranty during active period'
    ],
    highlightsBn: [
      'ফ্রি এনিডেস্ক রিমোট ইনস্টলেশন সাপোর্ট',
      'হোয়াটসঅ্যাপে দ্রুত উত্তর: +৮৮০১৭১২৭৯২১৮৪',
      'মেয়াদকালীন সম্পূর্ণ রিপ্লেসমেন্ট ওয়ারেন্টি'
    ],
    isPublished: true,
  },
  'payment-methods': {
    id: 'page-payment-methods',
    key: 'payment-methods',
    title: 'Online Payment Methods',
    titleBn: 'অনলাইন পেমেন্ট পদ্ধতি',
    lastUpdated: '2026-09-20',
    summary: 'Secure and localized payment options for customers in Bangladesh.',
    summaryBn: 'বিকাশ, নগদ, রকেট ও ব্যাংক পেমেন্টের বিস্তারিত নিয়মাবলী।',
    content: `We support the most convenient, secure, and widely used payment options in Bangladesh:

1. bKash Mobile Banking:
Send Money to our official bKash personal number (01712792184) or check out instantly via bKash live payment gateway.

2. Nagad Wallet Payment:
Send Money to our Nagad personal account (01712792184) and input your Transaction ID (TrxID) for instant order confirmation.

3. Rocket & Direct Bank Transfer:
Dutch-Bangla Bank Rocket mobile wallet and direct bank wire options are supported upon request.

4. Automated Online Payment Gateway:
Instant auto-checkout supporting Visa, Mastercard, Upay, and major credit/debit cards.`,
    contentBn: `আমরা বাংলাদেশে বহুল ব্যবহৃত নিরাপদ পেমেন্ট মাধ্যমসমূহ সাপোর্ট করি:

১. বিকাশ (bKash) পেমেন্ট:
আমাদের বিকাশ পার্সোনাল নম্বরে (01712792184) সেন্ড মানি অথবা বিকাশ লাইভ পেমেন্ট গেটওয়ের মাধ্যমে এক ক্লিকেই পেমেন্ট করতে পারবেন।

২. নগদ (Nagad) পেমেন্ট:
নগদ পার্সোনাল নম্বরে (01712792184) সেন্ড মানি করে ট্রানজেকশন আইডি (TrxID) দিলে তাৎক্ষণিক অর্ডার ভেরিফাই হয়।

৩. রকেট ও ব্যাংক ট্রান্সফার:
ডাচ-বাংলা ব্যাংক রকেট ওয়ালেট অথবা সরাসরি ব্যাংক অ্যাকাউন্ট ট্রান্সফারের মাধ্যমে সহজেই মূল্য পরিশোধ করা যায়।

৪. অটোমেটেড অনলাইন পেমেন্ট গেটওয়ে:
ভিসা, মাস্টারকার্ড, উপায় বা কার্ডের মাধ্যমে অটো পেমেন্ট করার সুবিধা রয়েছে, যা মুহূর্তেই আপনার অর্ডারটি সচল করে দেয়।`,
    highlights: [
      'bKash: 01712792184',
      'Nagad: 01712792184',
      'Rocket: 01712792184',
      'Bank Transfer upon request'
    ],
    highlightsBn: [
      'বিকাশ: ০১৭১২৭৯২১৮৪',
      'নগদ: ০১৭১২৭৯২১৮৪',
      'রকেট: ০১৭১২৭৯২১৮৪',
      'অনুরোধ সাপেক্ষে ব্যাংক ট্রান্সফার'
    ],
    isPublished: true,
  },
};

export function getAllPages(): Record<string, PolicyPage> {
  try {
    const raw = localStorage.getItem(PAGES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(DEFAULT_PAGES));
      return DEFAULT_PAGES;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PAGES, ...parsed };
  } catch (e) {
    console.error('Failed to load custom pages', e);
    return DEFAULT_PAGES;
  }
}

export function getPage(key: string): PolicyPage {
  const all = getAllPages();
  return all[key] || DEFAULT_PAGES[key] || {
    id: `page-${key}`,
    key,
    title: key.replace('-', ' ').toUpperCase(),
    titleBn: key.replace('-', ' ').toUpperCase(),
    lastUpdated: new Date().toISOString().split('T')[0],
    content: 'Content not yet defined.',
    contentBn: 'কন্টেন্ট এখনও দেওয়া হয়নি।',
    isPublished: true,
  };
}

export function savePage(page: PolicyPage): void {
  const all = getAllPages();
  all[page.key] = {
    ...page,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
  try {
    localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('dsp_pages_updated', { detail: { key: page.key } }));
  } catch (e) {
    console.error('Failed to save page', e);
  }
}

export function resetPageToDefault(key: string): PolicyPage {
  const defaultPage = DEFAULT_PAGES[key];
  if (!defaultPage) return getPage(key);

  const all = getAllPages();
  all[key] = { ...defaultPage };
  try {
    localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('dsp_pages_updated', { detail: { key } }));
  } catch (e) {
    console.error('Failed to reset page', e);
  }
  return defaultPage;
}
