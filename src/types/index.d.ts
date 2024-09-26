export type RegularPage = {
  frontmatter: {
    title: string;
    image?: string;
    description?: string;
    meta_title?: string;
    layout?: string;
    draft?: boolean;
  };
  content: string;
  slug?: string;
};

export type Post = {
  frontmatter: {
    title: string;
    meta_title?: string;
    description?: string;
    image?: string;
    categories: string[];
    author: string;
    tags: string[];
    date?: string;
    draft?: boolean;
    [key: `hrefLang${string}`]: string;
  };
  slug?: string;
  content?: string;
};

export type Author = {
  frontmatter: {
    title: string;
    image?: string;
    description?: string;
    meta_title?: string;
    social: [
      {
        name: string;
        icon: string;
        link: string;
      },
    ];
  };
  content?: string;
  slug?: string;
};

export type Feature = {
  button: button;
  image: string;
  bulletpoints: string[];
  content: string;
  title: string;
};

export type Testimonial = {
  name: string;
  designation: string;
  avatar: string;
  content: string;
};

export type Call_to_action = {
  enable?: boolean;
  title: string;
  description: string;
  image: string;
  button: Button;
};

export type Button = {
  enable: boolean;
  label: string;
  link: string;
};

export interface IChildNavigationLink {
  name: string;
  url: string;
}

export interface INavigationLink {
  name: string;
  url: string;
  hasChildren?: boolean;
  children?: IChildNavigationLink[];
}

export type ArticleState = {
  title: string;
  description: string;
  categories: string;
  content: string;
  path: string;
  [key: `hrefLang${string}`]: string;
};

export interface ImageCompressorLanguage {
  pageTitle: string;
  pageDescription: string;
  title: string;
  description: string;
  dropzoneText: string;
  compressButton: string;
  qualityLabel: string;
  originalImage: string;
  compressedImage: string;
  fileName: string;
  fileSize: string;
  compressionRatio: string;
  downloadButton: string;
  resizeOptionLabel: string;
  saveAllButton: string;
  selectedFiles: string;
  originalSize: string;
  compressed: string;
}