import {
  BlockquoteFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
  LinkFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

/**
 * The rich-text editor for pages: headings, quotations, lists, links and images.
 *
 * To credit a quotation, put the person's name on its own line inside the quote, in italics.
 *
 * Headings are limited to h2 and h3. The page title is the only h1, so whatever an editor
 * writes, the heading order stays correct for screen readers and search engines.
 */
export const pageEditor = lexicalEditor({
  features: ({ rootFeatures }) => [
    ...rootFeatures,
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    BlockquoteFeature(),
    LinkFeature({ enabledCollections: ['pages'] }),
    UploadFeature({ collections: { media: { fields: [] } } }),
    HorizontalRuleFeature(),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})
