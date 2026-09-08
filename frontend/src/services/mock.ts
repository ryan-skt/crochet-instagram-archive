export interface Classification {
  id: number;
  media_id: number;
  primary_category: string;
  subcategory: string;
  product_type: string | null;
  construction: string | null;
  image_type: string | null;
  colors: string[];
  pattern_style: string | null;
  objects: string[];
  description: string | null;
  confidence: number;
  needs_review: boolean;
  tags: string[];
}

export interface Media {
  id: number;
  post_id: string;
  media_url: string;
  local_path: string;
  media_type: string;
  download_status: string;
  sha256: string | null;
  phash: string | null;
  classification?: Classification;
  source_type: 'local' | 'instagram' | 'future';
  source_identifier: string;
  acquired_at: string;
}

export const mockMedia: Media[] = [
  {
    id: 1,
    post_id: "local_import_123",
    media_url: "http://example.com/bear.jpg",
    local_path: "data/organized/toys/amigurumi/toys__amigurumi__solid__000001.jpeg",
    media_type: "image",
    download_status: "success",
    sha256: "a1b2c3d4",
    phash: "11110000",
    source_type: 'local',
    source_identifier: 'import_batch_1',
    acquired_at: '2026-09-08T08:00:00Z',
    classification: {
      id: 1,
      media_id: 1,
      primary_category: "toys",
      subcategory: "amigurumi",
      product_type: "bear",
      construction: "finished_product",
      image_type: "lifestyle_photo",
      colors: ["brown", "white"],
      pattern_style: "solid",
      objects: ["bear", "yarn"],
      description: "A cute brown amigurumi bear.",
      confidence: 0.98,
      needs_review: false,
      tags: ["bear", "amigurumi", "toy", "crochet"]
    }
  },
  {
    id: 2,
    post_id: "local_import_124",
    media_url: "http://example.com/hat.jpg",
    local_path: "data/organized/accessories/hats/accessories__hats__striped__000002.jpeg",
    media_type: "image",
    download_status: "success",
    sha256: "e5f6g7h8",
    phash: "00001111",
    source_type: 'local',
    source_identifier: 'import_batch_1',
    acquired_at: '2026-09-08T08:00:00Z',
    classification: {
      id: 2,
      media_id: 2,
      primary_category: "accessories",
      subcategory: "hats",
      product_type: "sun hat",
      construction: "finished_product",
      image_type: "close_up",
      colors: ["pink", "white"],
      pattern_style: "striped",
      objects: ["hat"],
      description: "A pink and white striped crochet sun hat.",
      confidence: 0.95,
      needs_review: false,
      tags: ["hat", "striped", "accessories", "summer"]
    }
  },
  {
    id: 3,
    post_id: "local_import_125",
    media_url: "http://example.com/weird.jpg",
    local_path: "data/organized/_REVIEW/other__unidentified__unknown__000003.jpeg",
    media_type: "image",
    download_status: "success",
    sha256: "x9y0z1w2",
    phash: "10101010",
    source_type: 'local',
    source_identifier: 'import_batch_1',
    acquired_at: '2026-09-08T08:00:00Z',
    classification: {
      id: 3,
      media_id: 3,
      primary_category: "other",
      subcategory: "unidentified",
      product_type: null,
      construction: null,
      image_type: null,
      colors: [],
      pattern_style: null,
      objects: [],
      description: null,
      confidence: 0.42,
      needs_review: true,
      tags: []
    }
  },
  {
    id: 4,
    post_id: "local_import_126",
    media_url: "http://example.com/bag.jpg",
    local_path: "data/organized/bags/tote_bags/bags__tote_bags__granny_square__000004.jpeg",
    media_type: "image",
    download_status: "success",
    sha256: "a3b4c5d6",
    phash: "11001100",
    source_type: 'local',
    source_identifier: 'import_batch_1',
    acquired_at: '2026-09-08T08:00:00Z',
    classification: {
      id: 4,
      media_id: 4,
      primary_category: "bags",
      subcategory: "tote_bags",
      product_type: "tote",
      construction: "finished_product",
      image_type: "lifestyle_photo",
      colors: ["yellow", "green", "white"],
      pattern_style: "granny_square",
      objects: ["bag", "strap"],
      description: "A colorful granny square tote bag.",
      confidence: 0.99,
      needs_review: false,
      tags: ["bag", "tote", "granny square", "colorful"]
    }
  },
  {
    id: 5,
    post_id: "local_import_127",
    media_url: "http://example.com/blanket.jpg",
    local_path: "data/organized/home_decor/blankets/home_decor__blankets__chevron__000005.jpeg",
    media_type: "image",
    download_status: "success",
    sha256: "z1x2c3v4",
    phash: "00110011",
    source_type: 'local',
    source_identifier: 'import_batch_1',
    acquired_at: '2026-09-08T08:00:00Z',
    classification: {
      id: 5,
      media_id: 5,
      primary_category: "home_decor",
      subcategory: "blankets",
      product_type: "afghan",
      construction: "finished_product",
      image_type: "flat_lay",
      colors: ["blue", "grey"],
      pattern_style: "chevron",
      objects: ["blanket", "bed"],
      description: "A blue and grey chevron crochet blanket on a bed.",
      confidence: 0.88,
      needs_review: false,
      tags: ["blanket", "afghan", "chevron", "decor"]
    }
  }
];

export const getStatus = () => ({
  total_images: 1284,
  classified: 1272,
  review: 12,
  duplicates: 42
});
