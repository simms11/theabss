/**
 * The school's core pages: About, Educational Services, School Life and Privacy. The words are the
 * school's own, with each quotation set as a quotation with its source.
 *
 * The seed creates these once; after that they belong to the editors and are never
 * overwritten. Addresses match the redirects in src/lib/legacyRedirects.ts.
 */
import { DEFAULT_SUBJECTS } from '../../src/globals/SiteSettings'
import { ENQUIRY_RETENTION_MONTHS } from '../../src/lib/enquiry'

export type SeedPage = {
  title: string
  slug: string
  intro: string
  order: number
  /** Where the site links to the page. Defaults to the main menu. */
  navigation?: 'header' | 'footer'
  content: string
}

const ABOUT: SeedPage = {
  title: 'About',
  slug: 'about',
  intro: 'Who we are, how the school began and what we believe.',
  order: 1,
  content: `
> Education is the passport to the future, for tomorrow belongs to those who prepare for it today.
> — Malcolm X

## Who we are

The Afruika Bantu Saturday School was set up in 1997 by a group of elders who recognised that our children were underachieving in mainstream schools, and wanted to set up a provision in Brixton, in the south London borough of Lambeth, to counteract this. Malcolm X’s teaching on education is the ethos we follow in our school. We believe in academic excellence for all, and believe all our pupils should “aim high”.

## Our name

The school started in 1997 as the Next Generation Saturday School. In September 1999 one of our founding members, Afruika Bantu, our black history teacher, passed away unexpectedly, and the school was renamed in her honour.

Elder Afruika Bantu, whose name was derived from Steve Bantu Biko, a prominent leader of the black consciousness movement in South Africa, followed the teachings of the Honourable Marcus Mosiah Garvey. We teach our young people extensively about Papa Garvey, and about many other heroes and sheroes such as Assata Shakur, Kwame Nkrumah, Queen Mother Moore and Walter Rodney.

## What we teach

We teach Maths, English, Science and, most importantly, black (African) history to pupils aged 5 to 16. Our oldest students often bring in exam papers from their mainstream school, and our teachers support them extensively on Saturday mornings in the run-up to their GCSEs.

Reading is strongly encouraged in our school. It is a big focus of our English and black history lessons, as we try to instil this passion early. We also want learning to be fun, and for pupils to explore further, develop their own interest in particular subjects and share them with their peers. We want all our learners to make excellent progress and gain strong outcomes as a result of their study.

> Up, you mighty race, for you can accomplish what you will.
> — The Honourable Marcus Mosiah Garvey
`,
}

const EDUCATIONAL_SERVICES: SeedPage = {
  title: 'Educational Services',
  slug: 'educational-services',
  intro: 'African History, English, Maths and Science for children aged 5 to 16.',
  order: 2,
  content: `
> A people without the knowledge of their past history, origin and culture is like a tree without roots.
> — The Honourable Marcus Mosiah Garvey

${DEFAULT_SUBJECTS.map((subject) => `## ${subject.name}\n\n${subject.description}`).join('\n\n')}

## Extra support

The ABSS offers one-to-one, personal tutoring to students who need additional support in a particular subject. Get in touch to ask about tutoring or lessons, or to volunteer.
`,
}

const SCHOOL_LIFE: SeedPage = {
  title: 'School Life',
  slug: 'school-life',
  intro: 'Assemblies, trips and the cultural events that shape our year.',
  order: 3,
  content: `
> You can kill a revolutionary, but you can’t kill the revolution.
> — Fred Hampton

## How we treat each other

We believe all our young people should treat others with courtesy and consideration at all times, and we discuss this in our assemblies.

## Trips and cultural events

We take our young people to educational activities in the community as whole-school trips. There are also cultural imperatives that we prepare our children to take part in, including our annual memorial lecture, Black History Month and Kwanzaa celebrations. We prepare meticulously for these with the support of our parents and carers.

## A holistic approach

Our holistic approach helps to develop well-rounded individuals who are prepared to make positive contributions to society, in our community and beyond.
`,
}

/**
 * The privacy notice, written to match what this site actually does. It is a starting point,
 * not legal advice: the school should read it, correct anything that differs from its own
 * practice, and keep it up to date in the admin.
 */
const PRIVACY: SeedPage = {
  title: 'Privacy',
  slug: 'privacy',
  intro: 'What this website collects, why, and the choices you have.',
  order: 90,
  navigation: 'footer',
  content: `
## Who we are

This website is run by the Afruika Bantu Saturday School. We are responsible for the personal information described here. To ask about it, use the contact form on this site.

## Sending us a message

When you use the contact form we collect your name, your email address, your message and, if you choose to give them, a phone number and your child’s age band. We ask you not to send your child’s name or date of birth.

- We use this only to reply to you.
- It is seen only by the school’s administrators.
- It is deleted automatically after ${ENQUIRY_RETENTION_MONTHS} months.
- We rely on our legitimate interest in answering the questions people send us.

## Cookies and tracking

This website itself sets no cookies for visitors and we do not use analytics or advertising trackers. The only cookie of our own is the one that keeps school staff signed in to the site’s admin area. The Google map on some pages may set Google’s cookies, as described below.

## Maps, videos and payments

Some features come from other companies.

- **Map.** The map is provided by Google. On pages that show it, your browser connects to Google, which may set its own cookies.
- **Videos.** Videos are played by YouTube and load only when you press play.
- **Payments.** Online payments are made on GoCardless’s own pages. We never see your bank login or card details.

Each of these companies has its own privacy policy, which applies once you use its service.

## Photographs

Photographs of children appear on this site only with the consent of a parent or carer. If you would like a photograph of your child removed, tell us and we will take it down.

## Who helps us run the site

The site is hosted by companies that store data on our behalf: a website host, a database provider, a file store for photographs and documents, and an email service that delivers contact form messages to the school. They act only on our instructions.

## Your rights

You can ask us for a copy of the information we hold about you, ask us to correct it, or ask us to delete it. If you are unhappy with how we have handled your information, you can complain to the Information Commissioner’s Office at ico.org.uk.
`,
}

export const PAGES: SeedPage[] = [ABOUT, EDUCATIONAL_SERVICES, SCHOOL_LIFE, PRIVACY]
