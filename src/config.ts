// =============================================================================
// Villa Template Configuration
// =============================================================================
// All site content is configured here. Components render nothing when their
// primary config fields are empty strings or empty arrays.
// =============================================================================

// -----------------------------------------------------------------------------
// Site Config
// -----------------------------------------------------------------------------
export interface SiteConfig {
  title: string;
  description: string;
  language: string;
  keywords: string;
  ogImage: string;
  canonical: string;
}

export const siteConfig: SiteConfig = {
  title: "",
  description: "",
  language: "",
  keywords: "",
  ogImage: "",
  canonical: "",
};

// -----------------------------------------------------------------------------
// Navigation Config
// -----------------------------------------------------------------------------
export interface NavDropdownItem {
  name: string;
  href: string;
}

export interface NavLink {
  name: string;
  href: string;
  icon: string;
  dropdown?: NavDropdownItem[];
}

export interface NavigationConfig {
  brandName: string;
  brandSubname: string;
  tagline: string;
  navLinks: NavLink[];
  ctaButtonText: string;
}

export const navigationConfig: NavigationConfig = {
  brandName: "",
  brandSubname: "",
  tagline: "",
  navLinks: [],
  ctaButtonText: "",
};

// -----------------------------------------------------------------------------
// Preloader Config
// -----------------------------------------------------------------------------
export interface PreloaderConfig {
  brandName: string;
  brandSubname: string;
  yearText: string;
}

export const preloaderConfig: PreloaderConfig = {
  brandName: "",
  brandSubname: "",
  yearText: "",
};

// -----------------------------------------------------------------------------
// Hero Config
// -----------------------------------------------------------------------------
export interface HeroStat {
  value: number;
  suffix: string;
  label: string;
}

export interface HeroConfig {
  scriptText: string;
  mainTitle: string;
  ctaButtonText: string;
  ctaTarget: string;
  stats: HeroStat[];
  decorativeText: string;
  backgroundImage: string;
}

export const heroConfig: HeroConfig = {
  scriptText: "",  // Secondary messaging above title. Use this for extra words instead of lengthening mainTitle.
  mainTitle: "",   // KEEP SHORT: 3-6 words. If multi-line (\n), keep lines roughly equal length.
  ctaButtonText: "",
  ctaTarget: "",
  stats: [],
  decorativeText: "",
  backgroundImage: "",
};

// -----------------------------------------------------------------------------
// Wine Showcase Config
// -----------------------------------------------------------------------------
export interface Wine {
  id: string;
  name: string;
  subtitle: string;
  year: string;
  image: string;
  filter: string;
  glowColor: string;
  description: string;
  tastingNotes: string;
  alcohol: string;
  temperature: string;
  aging: string;
}

export interface WineFeature {
  icon: string;
  title: string;
  description: string;
}

export interface WineQuote {
  text: string;
  attribution: string;
  prefix: string;
}

export interface WineShowcaseConfig {
  scriptText: string;
  subtitle: string;
  mainTitle: string;
  wines: Wine[];
  features: WineFeature[];
  quote: WineQuote;
}

export const wineShowcaseConfig: WineShowcaseConfig = {
  scriptText: "",
  subtitle: "",
  mainTitle: "",  // Keep concise — preferably a single line. Move details to subtitle.
  wines: [],
  features: [],
  quote: {
    text: "",
    attribution: "",
    prefix: "",
  },
};

// -----------------------------------------------------------------------------
// Winery Carousel Config
// -----------------------------------------------------------------------------
export interface CarouselSlide {
  image: string;
  title: string;
  subtitle: string;
  area: string;
  unit: string;
  description: string;
}

export interface WineryCarouselConfig {
  scriptText: string;
  subtitle: string;
  mainTitle: string;
  locationTag: string;
  slides: CarouselSlide[];
}

export const wineryCarouselConfig: WineryCarouselConfig = {
  scriptText: "",
  subtitle: "",
  mainTitle: "",  // Keep concise — preferably a single line. Move details to subtitle.
  locationTag: "",
  slides: [],
};

// -----------------------------------------------------------------------------
// Museum Config
// -----------------------------------------------------------------------------
export interface TimelineEvent {
  year: string;
  event: string;
}

export interface MuseumTabContent {
  title: string;
  description: string;
  highlight: string;
}

export interface MuseumTab {
  id: string;
  name: string;
  icon: string;
  image: string;
  content: MuseumTabContent;
}

export interface MuseumQuote {
  prefix: string;
  text: string;
  attribution: string;
}

export interface MuseumConfig {
  scriptText: string;
  subtitle: string;
  mainTitle: string;
  introText: string;
  timeline: TimelineEvent[];
  tabs: MuseumTab[];
  openingHours: string;
  openingHoursLabel: string;
  ctaButtonText: string;
  yearBadge: string;
  yearBadgeLabel: string;
  quote: MuseumQuote;
  founderPhotoAlt: string;
  founderPhoto: string;
}

export const museumConfig: MuseumConfig = {
  scriptText: "",
  subtitle: "",
  mainTitle: "",  // Keep concise — preferably a single line. Move details to subtitle or introText.
  introText: "",
  timeline: [],
  tabs: [],
  openingHours: "",
  openingHoursLabel: "",
  ctaButtonText: "",
  yearBadge: "",
  yearBadgeLabel: "",
  quote: {
    prefix: "",
    text: "",
    attribution: "",
  },
  founderPhotoAlt: "",
  founderPhoto: "",
};

// -----------------------------------------------------------------------------
// News Config
// -----------------------------------------------------------------------------
export interface NewsArticle {
  id: number;
  image: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
}

export interface StoryQuote {
  prefix: string;
  text: string;
  attribution: string;
}

export interface StoryTimelineItem {
  value: string;
  label: string;
}

export interface NewsConfig {
  scriptText: string;
  subtitle: string;
  mainTitle: string;
  viewAllText: string;
  readMoreText: string;
  articles: NewsArticle[];
  testimonialsScriptText: string;
  testimonialsSubtitle: string;
  testimonialsMainTitle: string;
  testimonials: Testimonial[];
  storyScriptText: string;
  storySubtitle: string;
  storyTitle: string;
  storyParagraphs: string[];
  storyTimeline: StoryTimelineItem[];
  storyQuote: StoryQuote;
  storyImage: string;
  storyImageCaption: string;
}

export const newsConfig: NewsConfig = {
  scriptText: "",
  subtitle: "",
  mainTitle: "",  // Keep concise — preferably a single line.
  viewAllText: "",
  readMoreText: "",
  articles: [],
  testimonialsScriptText: "",
  testimonialsSubtitle: "",
  testimonialsMainTitle: "",
  testimonials: [],
  storyScriptText: "",
  storySubtitle: "",
  storyTitle: "",
  storyParagraphs: [],
  storyTimeline: [],
  storyQuote: {
    prefix: "",
    text: "",
    attribution: "",
  },
  storyImage: "",
  storyImageCaption: "",
};

// -----------------------------------------------------------------------------
// Contact Form Config
// -----------------------------------------------------------------------------
export interface ContactInfoItem {
  icon: string;
  label: string;
  value: string;
  subtext: string;
}

export interface ContactFormFields {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  visitDateLabel: string;
  visitorsLabel: string;
  visitorsOptions: string[];
  messageLabel: string;
  messagePlaceholder: string;
  submitText: string;
  submittingText: string;
  successMessage: string;
  errorMessage: string;
}

export interface ContactFormConfig {
  scriptText: string;
  subtitle: string;
  mainTitle: string;
  introText: string;
  contactInfoTitle: string;
  contactInfo: ContactInfoItem[];
  form: ContactFormFields;
  privacyNotice: string;
  formEndpoint: string;
}

export const contactFormConfig: ContactFormConfig = {
  scriptText: "",
  subtitle: "",
  mainTitle: "",  // Keep concise — preferably a single line.
  introText: "",
  contactInfoTitle: "",
  contactInfo: [],
  form: {
    nameLabel: "",
    namePlaceholder: "",
    emailLabel: "",
    emailPlaceholder: "",
    phoneLabel: "",
    phonePlaceholder: "",
    visitDateLabel: "",
    visitorsLabel: "",
    visitorsOptions: [],
    messageLabel: "",
    messagePlaceholder: "",
    submitText: "",
    submittingText: "",
    successMessage: "",
    errorMessage: "",
  },
  privacyNotice: "",
  formEndpoint: "",
};

// -----------------------------------------------------------------------------
// Footer Config
// -----------------------------------------------------------------------------
export interface SocialLink {
  icon: string;
  label: string;
  href: string;
}

export interface FooterLink {
  name: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export interface FooterContactItem {
  icon: string;
  text: string;
}

export interface FooterConfig {
  brandName: string;
  tagline: string;
  description: string;
  socialLinks: SocialLink[];
  linkGroups: FooterLinkGroup[];
  contactItems: FooterContactItem[];
  newsletterLabel: string;
  newsletterPlaceholder: string;
  newsletterButtonText: string;
  newsletterSuccessText: string;
  newsletterErrorText: string;
  newsletterEndpoint: string;
  copyrightText: string;
  legalLinks: string[];
  icpText: string;
  backToTopText: string;
  ageVerificationText: string;
}

export const footerConfig: FooterConfig = {
  brandName: "",
  tagline: "",
  description: "",
  socialLinks: [],
  linkGroups: [],
  contactItems: [],
  newsletterLabel: "",
  newsletterPlaceholder: "",
  newsletterButtonText: "",
  newsletterSuccessText: "",
  newsletterErrorText: "",
  newsletterEndpoint: "",
  copyrightText: "",
  legalLinks: [],
  icpText: "",
  backToTopText: "",
  ageVerificationText: "",
};

// -----------------------------------------------------------------------------
// Scroll To Top Config
// -----------------------------------------------------------------------------
export interface ScrollToTopConfig {
  ariaLabel: string;
}

export const scrollToTopConfig: ScrollToTopConfig = {
  ariaLabel: "",
};
