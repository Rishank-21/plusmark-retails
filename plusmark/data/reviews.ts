/**
 * Customer reviews, reproduced from the public Google Maps business profile
 * for Plusmark Display System. Keep this list to real reviews only.
 */

export interface Review {
  author: string;
  text: string;
  rating: number;
  /** Relative age as shown on Google, e.g. "4 years ago". */
  when?: string;
}

export const reviewSummary = {
  rating: 5.0,
  count: 95,
  source: "Google",
  profileUrl: "https://www.google.com/maps/search/?api=1&query=Plusmark+Display+System+Narolgam+Ahmedabad",
} as const;

/** Short highlights Google surfaces in its review summary. */
export const reviewHighlights = [
  "Cheapest rate with best quality and service.",
  "Nice product and fast service — amazing work by Plus Mark Display System.",
  "Nice management and shipping of products.",
];

export const reviews: Review[] = [
  {
    author: "Krishna Vivek",
    rating: 5,
    when: "4 years ago",
    text: "Great service, great quality of products. Would recommend without any hesitation.",
  },
  {
    author: "Vivek Chaudhary",
    rating: 5,
    when: "4 years ago",
    text: "It's a fully trustworthy product. I must give reference to other people, and the after-sales service is also genuine and the best.",
  },
  {
    author: "Tushar Gauswami",
    rating: 5,
    when: "4 years ago",
    text: "The belief enshrined in Plus Mark Display System is to consider the customer as king, because customers provide the opportunity to serve them in fine manners.",
  },
];

/** Topics Google highlights across the reviews, with how many reviews mention each. */
export const reviewTopics = [
  { label: "product", count: 23 },
  { label: "display system", count: 5 },
  { label: "industry", count: 4 },
] as const;

export interface GoogleReview {
  author: string;
  /** Reviewer profile line as shown on Google, e.g. "Local Guide · 7 reviews". */
  meta: string;
  /** Relative age as shown on Google when collected. */
  when: string;
  /** Verbatim review text; "…" marks text Google truncates. */
  text: string;
  /** Owner's reply, if any. */
  reply?: string;
}

/**
 * The full set of Google reviews for Plusmark Display System, verbatim (spelling as written by
 * the reviewers). Used by the review wall on designs D and E.
 */
export const googleReviews: GoogleReview[] = [
  { author: "Krishna Vivek", meta: "3 reviews", when: "4 years ago", text: "Great service, great quality of products would recommend without any hesitation." },
  { author: "VIVEK CHAUDHARY", meta: "2 reviews", when: "4 years ago", text: "It's fully trustworthy product. I must give reference to other people and after sales service also too genuine and best. …", reply: "Thanks" },
  { author: "Tushar Gauswami", meta: "1 review · 3 photos", when: "4 years ago", text: "The belief enshrined in plus mark displays system is to consider customer as king size because customers provides opportunity to serve them in fine manners" },
  { author: "Chaudhary Sumit", meta: "1 review", when: "Edited 4 years ago", text: "I have purchased 10 white board twice, I found quality of product is excellent, plusmark not compromise on in quality, I recommend it any one want quality of white board they can approach plusmark display system. Thanking to plusmark display system for providing quality products" },
  { author: "Patel Naresh", meta: "1 review", when: "4 years ago", text: "The vision of plus mark display system is to become India's best company in display industry by providing valuable products with best services" },
  { author: "raj veer", meta: "4 reviews · 1 photo", when: "Edited 5 years ago", text: "I am very happy to deal with plus mark display system, plus mark display system is a firm which is very known for its valuable service provider to its valuable customer I am very grateful to the plus mark display system for doing customer oriented business." },
  { author: "Arjun Goltar", meta: "5 reviews · 1 photo", when: "4 years ago", text: "I have purchased 20 boards from plusmark display system, I found plusmark display system provides quality products and No Compromise policy with quality, I highly recommend for purchase boards from plusmark display system …" },
  { author: "Joshi Vipul", meta: "1 review", when: "4 years ago", text: "Good quality ane very fast service that's I like Plus mark display system" },
  { author: "Mukesh Chaudhary", meta: "7 reviews", when: "5 years ago", text: "i purchased 5 white board from plusmark display system 2 month ago very good quality and they provide fast courier service" },
  { author: "Vivek Chaudhary", meta: "1 review", when: "5 years ago", text: "Trustworthy products... I bought 12 ceramic board in last month. All materials r best... …" },
  { author: "desai manoj", meta: "Local Guide · 7 reviews · 25 photos", when: "7 years ago", text: "Most trusted product..i was bought 25 number of display boards from here.. Good quality materials....... Nice management and shipping of products" },
  { author: "vipul chaudhary", meta: "5 reviews", when: "4 years ago", text: "I'm so glad to review that plus mark display is appreciable product which has good service and good experience" },
  { author: "Ragnath Chaudhary", meta: "1 review", when: "4 years ago", text: "Plus mark display system is best quality n good service I like it" },
  { author: "Thakor Lalsing", meta: "1 review", when: "5 years ago", text: "The belief enshrined in plus Mark Display system is to consider customer as king size because customer provides opportunity to serve them in fine manners" },
  { author: "Raj Chaudhary", meta: "6 reviews · 1 photo", when: "5 years ago", text: "Plus Mark Display system in Display industry caters valuable services to customers because it understand your needs and requirements" },
  { author: "S.b. chaudhary", meta: "1 review", when: "4 years ago", text: "Plus mark display system not just providing Quality products, along with the Quality product it build Relationships" },
  { author: "Abhi Chaudhary", meta: "1 review", when: "5 years ago", text: "One month ago me purchased 8*4 size 10 nos white board. Superb quality and fast service" },
  { author: "Himmat Chaudhari", meta: "Local Guide · 19 reviews · 2 photos", when: "4 years ago", text: "Best quality provide forever..... and service that provided by them as usually is more better...." },
  { author: "Desai Chela", meta: "2 reviews · 1 photo", when: "5 years ago", text: "The vision of plus Mark Display system is to become India's best company in Display industry by providing valuable products with best services" },
  { author: "Barmal bhai Chaudhary", meta: "1 review", when: "4 years ago", text: "Very good Quality and fast service that's I like plus mark display system" },
  { author: "I am Jaylu", meta: "4 reviews", when: "4 years ago", text: "Plus mark display sistem is best quality good transportation n sarvice" },
  { author: "Paresh Chaudhary", meta: "1 review", when: "4 years ago", text: "Nice product and fast service amazing work by plus mark display system" },
  { author: "Jagdish Chaudhari", meta: "2 reviews", when: "5 years ago", text: "Super quality and best service. Plusmark display nice work" },
  { author: "Chaudhary Saheli", meta: "1 review", when: "4 years ago", text: "What a product I am use a very long time amazing products and very fast service 👍👌 …" },
  { author: "S P Zala", meta: "Local Guide · 4 reviews · 26 photos", when: "Edited 7 years ago", text: "Trusted and good quality with fast service I like this company's service" },
  { author: "MAHESH kumar Chaudhary", meta: "1 review · 9 photos", when: "4 years ago", text: "Plus Mark display system is Best quality n good sarvice" },
  { author: "Govind chaudhary", meta: "1 review", when: "4 years ago", text: "The philosophy of plusmark display system is provide valuable product to it's customer," },
  { author: "Chaudhary Navin", meta: "3 reviews", when: "10 years ago", text: "I perches 5 megnetic bord give good service and material also fast transport factionality thank you so much" },
  { author: "Kirit thakor Thakor", meta: "1 review", when: "4 years ago", text: "What a amazing product I am used to last 3 years I like your service" },
  { author: "Indian gaming", meta: "1 review", when: "4 years ago", text: "Variety of product with utmost quality is plus mark display systam" },
  { author: "Patel Manish D", meta: "5 reviews · 1 photo", when: "7 years ago", text: "I have purchased 5 ceramic board quality is good", reply: "thanks you" },
  { author: "Piyush Dabhi", meta: "1 review", when: "4 years ago", text: "What a product amazing very fast service I like your products" },
  { author: "CHAUDHARY DALPATBHAI", meta: "3 reviews", when: "5 years ago", text: "Plus Mark Display system not just providing Quality product, along with the Quality product it build Relationships" },
  { author: "jayesh movaliya", meta: "2 reviews", when: "4 years ago", text: "great product nd materials.... Owners are also genuine." },
  { author: "Naresh Chaudhary", meta: "3 reviews · 1 photo", when: "Edited 7 years ago", text: "Best price with good quality and service.." },
  { author: "Mr 64 Jogani", meta: "1 review", when: "4 years ago", text: "Nice product I am use a very long time best product" },
  { author: "Chaudhary Sumit", meta: "1 review", when: "6 years ago", text: "Best quality 👌👌👌 and fast service …" },
  { author: "D Chaudhari", meta: "Local Guide · 63 reviews · 15 photos", when: "5 years ago", text: "Good quality with nice material and fast service." },
  { author: "shekar kamble", meta: "3 reviews", when: "7 years ago", text: "Very smooth & fast service provider", reply: "Thanks sir" },
  { author: "Chaudhary Bharat", meta: "2 reviews", when: "Edited 4 years ago", text: "Good quality. Best finishing. Easy to write.", reply: "thanks sir" },
  { author: "Udhaybhan Kumar", meta: "1 review", when: "4 years ago", text: "Best quality and super service" },
  { author: "Ashokbhai Patel", meta: "Local Guide · 35 reviews · 244 photos", when: "Edited 7 years ago", text: "Best price with good quality and service..", reply: "thanks you" },
  { author: "Vtv Jayesh", meta: "1 review", when: "5 years ago", text: "Amazing quality with fast delievry .Good Job team" },
  { author: "chavda sanjay", meta: "2 reviews", when: "5 years ago", text: "Variety of product with utmost Quality is Plus Mark Display system" },
  { author: "Parth Thummar", meta: "6 reviews · 2 photos", when: "5 years ago", text: "Cheapest Rate with Best quality and service....." },
  { author: "Rajesh Chaudhary", meta: "3 reviews", when: "4 years ago", text: "Plus mark display system is nice so good" },
  { author: "Ajay Desai", meta: "5 reviews", when: "4 years ago", text: "Very good service and quality" },
  { author: "Desai Kamlesh", meta: "2 reviews", when: "5 years ago", text: "Synonyms of QUALITY PRDUCT is Plus Mark Display System" },
  { author: "Chintan Chaudhary", meta: "1 review", when: "4 years ago", text: "One and only in display system industy is plus mark display system" },
  { author: "બાબૃ ભાઈ ભરવાડ", meta: "2 reviews", when: "5 years ago", text: "Super quality and fast service" },
  { author: "purohit kiran purohit kiran", meta: "2 reviews · 2 photos", when: "5 years ago", text: "One and only in Display system Industry is Plus Mark Display system" },
  { author: "Piyush Chaudhary", meta: "1 review", when: "5 years ago", text: "Best quality and best service" },
  { author: "Sohel Rathod", meta: "1 review", when: "5 years ago", text: "Super quality and amazing writing porsan" },
  { author: "Vinit Malviya", meta: "Local Guide · 4 reviews · 2 photos", when: "4 years ago", text: "Good.product I just bought 10 board." },
  { author: "Er_ANKIT KAINANI", meta: "2 reviews · 1 photo", when: "5 years ago", text: "Very good, superb, awesome quality.." },
  { author: "Suresh Chaudhary", meta: "5 reviews", when: "5 years ago", text: "Best material And good service" },
  { author: "Devjibhai Chaudhary", meta: "1 review", when: "4 years ago", text: "Bacbone of education system is a white board and backbone of white board is plus mark display system" },
  { author: "Samik Shah", meta: "2 reviews", when: "5 years ago", text: "Superb quality and good service" },
  { author: "Raju Goletar", meta: "2 reviews · 16 photos", when: "7 years ago", text: "Excellent good quality", reply: "thanks you" },
  { author: "jadav MaheshKumar", meta: "1 review", when: "5 years ago", text: "Amazing super Quality......Jagdish" },
  { author: "Chaudhary Dharti", meta: "1 review", when: "7 years ago", text: "Very good service" },
  { author: "pinal vekariya", meta: "7 reviews", when: "5 years ago", text: "Service provide outstanding at the Time" },
  { author: "Pintu Gediya", meta: "1 review", when: "4 years ago", text: "Best quality products" },
  { author: "Anand Kumawat", meta: "1 review", when: "5 years ago", text: "Export Quality with fast service" },
  { author: "tofik mandhara", meta: "1 review", when: "5 years ago", text: "Good quality and best service" },
  { author: "Prakash Jadav", meta: "1 review", when: "5 years ago", text: "Amazing super Quality" },
  { author: "patel govind", meta: "1 review", when: "7 years ago", text: "Good quality" },
  { author: "KHANDLA BHAVIN", meta: "4 reviews", when: "5 years ago", text: "Backbone of education system is a white board and backbone of white board is Plus Mark Display system" },
  { author: "chaudhary pravin", meta: "6 reviews · 4 photos", when: "7 years ago", text: "Good service" },
  { author: "rahul solanki", meta: "2 reviews", when: "5 years ago", text: "Best quality .." },
  { author: "pragati chaudhary", meta: "2 reviews", when: "5 years ago", text: "Super quality" },
  { author: "vasu Patel", meta: "1 review", when: "5 years ago", text: "Nice product 👍 …" },
];
