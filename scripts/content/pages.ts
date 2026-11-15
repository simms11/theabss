/**
 * The school's core pages: About, Educational Services and School Life. The words are the
 * school's own, with each quotation set as a quotation with its source.
 *
 * The seed creates these once; after that they belong to the editors and are never
 * overwritten. Addresses match the redirects in src/lib/legacyRedirects.ts.
 */
import { DEFAULT_SUBJECTS } from '../../src/globals/SiteSettings'

export type SeedPage = {
  title: string
  slug: string
  intro: string
  order: number
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

export const PAGES: SeedPage[] = [ABOUT, EDUCATIONAL_SERVICES, SCHOOL_LIFE]
