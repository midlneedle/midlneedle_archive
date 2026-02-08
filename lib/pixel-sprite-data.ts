export type PixelTone = "dark" | "mid" | "light" | "faint"

export interface PixelPoint {
  x: number
  y: number
  tone: PixelTone
}

export type PixelVariant = "playground" | "cases" | "connect"

export const PIXEL_CORNERS: PixelPoint[] = [
  { x: 1, y: 1, tone: "faint" },
  { x: 10, y: 1, tone: "faint" },
  { x: 1, y: 10, tone: "faint" },
  { x: 10, y: 10, tone: "faint" },
]

export const TITLE_PIXEL_TONES: Record<PixelTone, string> = {
  dark: "rgb(53 59 66 / 0.9)",
  mid: "rgb(53 59 66 / 0.6)",
  light: "rgb(53 59 66 / 0.35)",
  faint: "rgb(53 59 66 / 0.18)",
}

export const LOADER_PIXEL_TONES: Record<PixelTone, string> = {
  dark: "rgb(53 59 66 / 0.52)",
  mid: "rgb(53 59 66 / 0.52)",
  light: "rgb(53 59 66 / 0.52)",
  faint: "rgb(53 59 66 / 0.18)",
}

export const TITLE_FRAME_DURATION_MS: Record<PixelVariant, { idle: number; hover: number }> = {
  playground: { idle: 567, hover: 267 },
  cases: { idle: 600, hover: 267 },
  connect: { idle: 850, hover: 400 },
}

export const LOADER_FRAME_DURATION_MS = 475

export const TITLE_PIXEL_FRAMES: Record<PixelVariant, PixelPoint[][]> = 
{
  playground: [
    [
      {
        x: 2,
        y: 3,
        tone: "dark"
      },
      {
        x: 2,
        y: 6,
        tone: "dark"
      },
      {
        x: 9,
        y: 4,
        tone: "dark"
      },
      {
        x: 9,
        y: 7,
        tone: "dark"
      },
      {
        x: 4,
        y: 4,
        tone: "dark"
      },
      {
        x: 5,
        y: 5,
        tone: "dark"
      },
      {
        x: 6,
        y: 6,
        tone: "dark"
      },
      {
        x: 7,
        y: 5,
        tone: "dark"
      },
      {
        x: 3,
        y: 4,
        tone: "mid"
      },
      {
        x: 3,
        y: 6,
        tone: "mid"
      },
      {
        x: 8,
        y: 5,
        tone: "mid"
      },
      {
        x: 6,
        y: 3,
        tone: "mid"
      },
      {
        x: 5,
        y: 4,
        tone: "light"
      },
      {
        x: 5,
        y: 6,
        tone: "light"
      },
      {
        x: 7,
        y: 7,
        tone: "light"
      },
      {
        x: 4,
        y: 7,
        tone: "light"
      },
      {
        x: 8,
        y: 3,
        tone: "light"
      }
    ],
    [
      {
        x: 2,
        y: 4,
        tone: "dark"
      },
      {
        x: 2,
        y: 7,
        tone: "dark"
      },
      {
        x: 9,
        y: 3,
        tone: "dark"
      },
      {
        x: 9,
        y: 6,
        tone: "dark"
      },
      {
        x: 4,
        y: 5,
        tone: "dark"
      },
      {
        x: 5,
        y: 4,
        tone: "dark"
      },
      {
        x: 6,
        y: 3,
        tone: "dark"
      },
      {
        x: 7,
        y: 2,
        tone: "dark"
      },
      {
        x: 3,
        y: 5,
        tone: "mid"
      },
      {
        x: 4,
        y: 6,
        tone: "mid"
      },
      {
        x: 7,
        y: 5,
        tone: "mid"
      },
      {
        x: 8,
        y: 4,
        tone: "mid"
      },
      {
        x: 5,
        y: 5,
        tone: "light"
      },
      {
        x: 6,
        y: 6,
        tone: "light"
      },
      {
        x: 4,
        y: 8,
        tone: "light"
      },
      {
        x: 7,
        y: 7,
        tone: "light"
      }
    ],
    [
      {
        x: 2,
        y: 5,
        tone: "dark"
      },
      {
        x: 2,
        y: 8,
        tone: "dark"
      },
      {
        x: 9,
        y: 2,
        tone: "dark"
      },
      {
        x: 9,
        y: 5,
        tone: "dark"
      },
      {
        x: 4,
        y: 6,
        tone: "dark"
      },
      {
        x: 5,
        y: 6,
        tone: "dark"
      },
      {
        x: 6,
        y: 5,
        tone: "dark"
      },
      {
        x: 7,
        y: 4,
        tone: "dark"
      },
      {
        x: 3,
        y: 6,
        tone: "mid"
      },
      {
        x: 6,
        y: 7,
        tone: "mid"
      },
      {
        x: 8,
        y: 4,
        tone: "mid"
      },
      {
        x: 5,
        y: 3,
        tone: "mid"
      },
      {
        x: 5,
        y: 7,
        tone: "light"
      },
      {
        x: 4,
        y: 5,
        tone: "light"
      },
      {
        x: 7,
        y: 6,
        tone: "light"
      },
      {
        x: 8,
        y: 6,
        tone: "light"
      }
    ],
    [
      {
        x: 2,
        y: 4,
        tone: "dark"
      },
      {
        x: 2,
        y: 7,
        tone: "dark"
      },
      {
        x: 9,
        y: 3,
        tone: "dark"
      },
      {
        x: 9,
        y: 6,
        tone: "dark"
      },
      {
        x: 4,
        y: 7,
        tone: "dark"
      },
      {
        x: 5,
        y: 6,
        tone: "dark"
      },
      {
        x: 6,
        y: 5,
        tone: "dark"
      },
      {
        x: 7,
        y: 4,
        tone: "dark"
      },
      {
        x: 3,
        y: 5,
        tone: "mid"
      },
      {
        x: 5,
        y: 4,
        tone: "mid"
      },
      {
        x: 7,
        y: 7,
        tone: "mid"
      },
      {
        x: 8,
        y: 5,
        tone: "mid"
      },
      {
        x: 4,
        y: 6,
        tone: "light"
      },
      {
        x: 6,
        y: 6,
        tone: "light"
      },
      {
        x: 5,
        y: 8,
        tone: "light"
      },
      {
        x: 3,
        y: 3,
        tone: "light"
      }
    ],
    [
      {
        x: 2,
        y: 3,
        tone: "dark"
      },
      {
        x: 2,
        y: 6,
        tone: "dark"
      },
      {
        x: 9,
        y: 4,
        tone: "dark"
      },
      {
        x: 9,
        y: 7,
        tone: "dark"
      },
      {
        x: 4,
        y: 6,
        tone: "dark"
      },
      {
        x: 5,
        y: 7,
        tone: "dark"
      },
      {
        x: 6,
        y: 8,
        tone: "dark"
      },
      {
        x: 5,
        y: 5,
        tone: "dark"
      },
      {
        x: 3,
        y: 4,
        tone: "mid"
      },
      {
        x: 7,
        y: 6,
        tone: "mid"
      },
      {
        x: 8,
        y: 5,
        tone: "mid"
      },
      {
        x: 6,
        y: 4,
        tone: "mid"
      },
      {
        x: 4,
        y: 5,
        tone: "light"
      },
      {
        x: 6,
        y: 7,
        tone: "light"
      },
      {
        x: 8,
        y: 6,
        tone: "light"
      },
      {
        x: 7,
        y: 8,
        tone: "light"
      }
    ],
    [
      {
        x: 2,
        y: 4,
        tone: "dark"
      },
      {
        x: 2,
        y: 7,
        tone: "dark"
      },
      {
        x: 9,
        y: 3,
        tone: "dark"
      },
      {
        x: 9,
        y: 6,
        tone: "dark"
      },
      {
        x: 4,
        y: 5,
        tone: "dark"
      },
      {
        x: 5,
        y: 6,
        tone: "dark"
      },
      {
        x: 6,
        y: 7,
        tone: "dark"
      },
      {
        x: 5,
        y: 4,
        tone: "dark"
      },
      {
        x: 3,
        y: 6,
        tone: "mid"
      },
      {
        x: 7,
        y: 5,
        tone: "mid"
      },
      {
        x: 8,
        y: 6,
        tone: "mid"
      },
      {
        x: 4,
        y: 8,
        tone: "mid"
      },
      {
        x: 4,
        y: 4,
        tone: "light"
      },
      {
        x: 6,
        y: 6,
        tone: "light"
      },
      {
        x: 8,
        y: 7,
        tone: "light"
      },
      {
        x: 3,
        y: 5,
        tone: "light"
      }
    ]
  ],
  cases: [
    [
      {
        x: 3,
        y: 2,
        tone: "dark"
      },
      {
        x: 4,
        y: 2,
        tone: "dark"
      },
      {
        x: 3,
        y: 3,
        tone: "dark"
      },
      {
        x: 4,
        y: 3,
        tone: "dark"
      },
      {
        x: 6,
        y: 4,
        tone: "dark"
      },
      {
        x: 7,
        y: 4,
        tone: "dark"
      },
      {
        x: 6,
        y: 5,
        tone: "dark"
      },
      {
        x: 4,
        y: 7,
        tone: "mid"
      },
      {
        x: 5,
        y: 7,
        tone: "mid"
      },
      {
        x: 4,
        y: 8,
        tone: "mid"
      },
      {
        x: 5,
        y: 8,
        tone: "mid"
      },
      {
        x: 5,
        y: 5,
        tone: "mid"
      },
      {
        x: 3,
        y: 5,
        tone: "light"
      },
      {
        x: 6,
        y: 6,
        tone: "light"
      },
      {
        x: 7,
        y: 6,
        tone: "light"
      },
      {
        x: 2,
        y: 6,
        tone: "light"
      }
    ],
    [
      {
        x: 3,
        y: 3,
        tone: "dark"
      },
      {
        x: 4,
        y: 3,
        tone: "dark"
      },
      {
        x: 3,
        y: 4,
        tone: "dark"
      },
      {
        x: 4,
        y: 4,
        tone: "dark"
      },
      {
        x: 6,
        y: 5,
        tone: "dark"
      },
      {
        x: 7,
        y: 5,
        tone: "dark"
      },
      {
        x: 7,
        y: 6,
        tone: "dark"
      },
      {
        x: 4,
        y: 8,
        tone: "mid"
      },
      {
        x: 5,
        y: 8,
        tone: "mid"
      },
      {
        x: 4,
        y: 9,
        tone: "mid"
      },
      {
        x: 5,
        y: 6,
        tone: "mid"
      },
      {
        x: 6,
        y: 6,
        tone: "mid"
      },
      {
        x: 3,
        y: 6,
        tone: "light"
      },
      {
        x: 6,
        y: 7,
        tone: "light"
      },
      {
        x: 8,
        y: 6,
        tone: "light"
      },
      {
        x: 2,
        y: 7,
        tone: "light"
      }
    ],
    [
      {
        x: 2,
        y: 4,
        tone: "dark"
      },
      {
        x: 3,
        y: 4,
        tone: "dark"
      },
      {
        x: 4,
        y: 4,
        tone: "dark"
      },
      {
        x: 2,
        y: 5,
        tone: "dark"
      },
      {
        x: 6,
        y: 3,
        tone: "dark"
      },
      {
        x: 6,
        y: 4,
        tone: "dark"
      },
      {
        x: 6,
        y: 5,
        tone: "dark"
      },
      {
        x: 5,
        y: 7,
        tone: "mid"
      },
      {
        x: 6,
        y: 7,
        tone: "mid"
      },
      {
        x: 5,
        y: 8,
        tone: "mid"
      },
      {
        x: 3,
        y: 5,
        tone: "mid"
      },
      {
        x: 4,
        y: 5,
        tone: "mid"
      },
      {
        x: 4,
        y: 6,
        tone: "light"
      },
      {
        x: 7,
        y: 6,
        tone: "light"
      },
      {
        x: 8,
        y: 7,
        tone: "light"
      },
      {
        x: 3,
        y: 6,
        tone: "light"
      }
    ],
    [
      {
        x: 3,
        y: 5,
        tone: "dark"
      },
      {
        x: 4,
        y: 5,
        tone: "dark"
      },
      {
        x: 3,
        y: 6,
        tone: "dark"
      },
      {
        x: 4,
        y: 6,
        tone: "dark"
      },
      {
        x: 6,
        y: 4,
        tone: "dark"
      },
      {
        x: 7,
        y: 4,
        tone: "dark"
      },
      {
        x: 7,
        y: 5,
        tone: "dark"
      },
      {
        x: 7,
        y: 6,
        tone: "dark"
      },
      {
        x: 4,
        y: 8,
        tone: "mid"
      },
      {
        x: 5,
        y: 8,
        tone: "mid"
      },
      {
        x: 6,
        y: 8,
        tone: "mid"
      },
      {
        x: 5,
        y: 7,
        tone: "mid"
      },
      {
        x: 3,
        y: 7,
        tone: "light"
      },
      {
        x: 6,
        y: 7,
        tone: "light"
      },
      {
        x: 8,
        y: 6,
        tone: "light"
      },
      {
        x: 4,
        y: 7,
        tone: "light"
      }
    ],
    [
      {
        x: 3,
        y: 3,
        tone: "dark"
      },
      {
        x: 4,
        y: 3,
        tone: "dark"
      },
      {
        x: 5,
        y: 3,
        tone: "dark"
      },
      {
        x: 5,
        y: 4,
        tone: "dark"
      },
      {
        x: 6,
        y: 5,
        tone: "dark"
      },
      {
        x: 6,
        y: 6,
        tone: "dark"
      },
      {
        x: 7,
        y: 6,
        tone: "dark"
      },
      {
        x: 4,
        y: 7,
        tone: "mid"
      },
      {
        x: 5,
        y: 7,
        tone: "mid"
      },
      {
        x: 4,
        y: 8,
        tone: "mid"
      },
      {
        x: 5,
        y: 8,
        tone: "mid"
      },
      {
        x: 5,
        y: 5,
        tone: "mid"
      },
      {
        x: 3,
        y: 6,
        tone: "light"
      },
      {
        x: 6,
        y: 4,
        tone: "light"
      },
      {
        x: 8,
        y: 7,
        tone: "light"
      },
      {
        x: 2,
        y: 5,
        tone: "light"
      }
    ],
    [
      {
        x: 2,
        y: 5,
        tone: "dark"
      },
      {
        x: 3,
        y: 5,
        tone: "dark"
      },
      {
        x: 4,
        y: 5,
        tone: "dark"
      },
      {
        x: 4,
        y: 6,
        tone: "dark"
      },
      {
        x: 6,
        y: 3,
        tone: "dark"
      },
      {
        x: 7,
        y: 3,
        tone: "dark"
      },
      {
        x: 7,
        y: 4,
        tone: "dark"
      },
      {
        x: 5,
        y: 7,
        tone: "mid"
      },
      {
        x: 6,
        y: 7,
        tone: "mid"
      },
      {
        x: 6,
        y: 8,
        tone: "mid"
      },
      {
        x: 5,
        y: 6,
        tone: "mid"
      },
      {
        x: 3,
        y: 7,
        tone: "light"
      },
      {
        x: 4,
        y: 8,
        tone: "light"
      },
      {
        x: 8,
        y: 6,
        tone: "light"
      },
      {
        x: 2,
        y: 7,
        tone: "light"
      },
      {
        x: 5,
        y: 8,
        tone: "light"
      }
    ]
  ],
  connect: [
    [
      {
        x: 2,
        y: 2,
        tone: "dark"
      },
      {
        x: 3,
        y: 3,
        tone: "dark"
      },
      {
        x: 4,
        y: 4,
        tone: "dark"
      },
      {
        x: 5,
        y: 5,
        tone: "dark"
      },
      {
        x: 6,
        y: 6,
        tone: "dark"
      },
      {
        x: 7,
        y: 7,
        tone: "dark"
      },
      {
        x: 2,
        y: 6,
        tone: "mid"
      },
      {
        x: 7,
        y: 2,
        tone: "mid"
      },
      {
        x: 2,
        y: 4,
        tone: "light"
      },
      {
        x: 8,
        y: 2,
        tone: "light"
      },
      {
        x: 9,
        y: 6,
        tone: "light"
      }
    ],
    [
      {
        x: 5,
        y: 2,
        tone: "dark"
      },
      {
        x: 5,
        y: 3,
        tone: "dark"
      },
      {
        x: 5,
        y: 4,
        tone: "dark"
      },
      {
        x: 5,
        y: 5,
        tone: "dark"
      },
      {
        x: 5,
        y: 6,
        tone: "dark"
      },
      {
        x: 5,
        y: 7,
        tone: "dark"
      },
      {
        x: 5,
        y: 8,
        tone: "dark"
      },
      {
        x: 4,
        y: 4,
        tone: "mid"
      },
      {
        x: 6,
        y: 6,
        tone: "mid"
      },
      {
        x: 2,
        y: 2,
        tone: "light"
      },
      {
        x: 8,
        y: 7,
        tone: "light"
      },
      {
        x: 9,
        y: 4,
        tone: "light"
      }
    ],
    [
      {
        x: 2,
        y: 7,
        tone: "dark"
      },
      {
        x: 3,
        y: 6,
        tone: "dark"
      },
      {
        x: 4,
        y: 5,
        tone: "dark"
      },
      {
        x: 5,
        y: 4,
        tone: "dark"
      },
      {
        x: 6,
        y: 3,
        tone: "dark"
      },
      {
        x: 7,
        y: 2,
        tone: "dark"
      },
      {
        x: 2,
        y: 5,
        tone: "mid"
      },
      {
        x: 8,
        y: 4,
        tone: "mid"
      },
      {
        x: 2,
        y: 2,
        tone: "light"
      },
      {
        x: 9,
        y: 5,
        tone: "light"
      },
      {
        x: 7,
        y: 9,
        tone: "light"
      }
    ],
    [
      {
        x: 2,
        y: 5,
        tone: "dark"
      },
      {
        x: 3,
        y: 5,
        tone: "dark"
      },
      {
        x: 4,
        y: 5,
        tone: "dark"
      },
      {
        x: 5,
        y: 5,
        tone: "dark"
      },
      {
        x: 6,
        y: 5,
        tone: "dark"
      },
      {
        x: 7,
        y: 5,
        tone: "dark"
      },
      {
        x: 8,
        y: 5,
        tone: "dark"
      },
      {
        x: 4,
        y: 4,
        tone: "mid"
      },
      {
        x: 6,
        y: 6,
        tone: "mid"
      },
      {
        x: 2,
        y: 2,
        tone: "light"
      },
      {
        x: 9,
        y: 2,
        tone: "light"
      },
      {
        x: 5,
        y: 9,
        tone: "light"
      }
    ]
  ]
}

export const LOADER_PIXEL_FRAMES: PixelPoint[][] = 
[
  [
    {
      x: 2,
      y: 2,
      tone: "dark"
    },
    {
      x: 3,
      y: 2,
      tone: "mid"
    },
    {
      x: 4,
      y: 2,
      tone: "mid"
    },
    {
      x: 5,
      y: 2,
      tone: "light"
    },
    {
      x: 2,
      y: 3,
      tone: "mid"
    },
    {
      x: 3,
      y: 3,
      tone: "mid"
    },
    {
      x: 4,
      y: 3,
      tone: "light"
    },
    {
      x: 5,
      y: 3,
      tone: "light"
    },
    {
      x: 2,
      y: 4,
      tone: "mid"
    },
    {
      x: 3,
      y: 4,
      tone: "light"
    },
    {
      x: 4,
      y: 4,
      tone: "light"
    },
    {
      x: 5,
      y: 4,
      tone: "light"
    },
    {
      x: 2,
      y: 5,
      tone: "light"
    },
    {
      x: 3,
      y: 5,
      tone: "light"
    },
    {
      x: 4,
      y: 5,
      tone: "light"
    },
    {
      x: 5,
      y: 5,
      tone: "light"
    }
  ],
  [
    {
      x: 6,
      y: 2,
      tone: "dark"
    },
    {
      x: 7,
      y: 2,
      tone: "mid"
    },
    {
      x: 8,
      y: 2,
      tone: "mid"
    },
    {
      x: 9,
      y: 2,
      tone: "light"
    },
    {
      x: 6,
      y: 3,
      tone: "mid"
    },
    {
      x: 7,
      y: 3,
      tone: "mid"
    },
    {
      x: 8,
      y: 3,
      tone: "light"
    },
    {
      x: 9,
      y: 3,
      tone: "light"
    },
    {
      x: 6,
      y: 4,
      tone: "mid"
    },
    {
      x: 7,
      y: 4,
      tone: "light"
    },
    {
      x: 8,
      y: 4,
      tone: "light"
    },
    {
      x: 9,
      y: 4,
      tone: "light"
    },
    {
      x: 6,
      y: 5,
      tone: "light"
    },
    {
      x: 7,
      y: 5,
      tone: "light"
    },
    {
      x: 8,
      y: 5,
      tone: "light"
    },
    {
      x: 9,
      y: 5,
      tone: "light"
    }
  ],
  [
    {
      x: 6,
      y: 6,
      tone: "dark"
    },
    {
      x: 7,
      y: 6,
      tone: "mid"
    },
    {
      x: 8,
      y: 6,
      tone: "mid"
    },
    {
      x: 9,
      y: 6,
      tone: "light"
    },
    {
      x: 6,
      y: 7,
      tone: "mid"
    },
    {
      x: 7,
      y: 7,
      tone: "mid"
    },
    {
      x: 8,
      y: 7,
      tone: "light"
    },
    {
      x: 9,
      y: 7,
      tone: "light"
    },
    {
      x: 6,
      y: 8,
      tone: "mid"
    },
    {
      x: 7,
      y: 8,
      tone: "light"
    },
    {
      x: 8,
      y: 8,
      tone: "light"
    },
    {
      x: 9,
      y: 8,
      tone: "light"
    },
    {
      x: 6,
      y: 9,
      tone: "light"
    },
    {
      x: 7,
      y: 9,
      tone: "light"
    },
    {
      x: 8,
      y: 9,
      tone: "light"
    },
    {
      x: 9,
      y: 9,
      tone: "light"
    }
  ],
  [
    {
      x: 2,
      y: 6,
      tone: "dark"
    },
    {
      x: 3,
      y: 6,
      tone: "mid"
    },
    {
      x: 4,
      y: 6,
      tone: "mid"
    },
    {
      x: 5,
      y: 6,
      tone: "light"
    },
    {
      x: 2,
      y: 7,
      tone: "mid"
    },
    {
      x: 3,
      y: 7,
      tone: "mid"
    },
    {
      x: 4,
      y: 7,
      tone: "light"
    },
    {
      x: 5,
      y: 7,
      tone: "light"
    },
    {
      x: 2,
      y: 8,
      tone: "mid"
    },
    {
      x: 3,
      y: 8,
      tone: "light"
    },
    {
      x: 4,
      y: 8,
      tone: "light"
    },
    {
      x: 5,
      y: 8,
      tone: "light"
    },
    {
      x: 2,
      y: 9,
      tone: "light"
    },
    {
      x: 3,
      y: 9,
      tone: "light"
    },
    {
      x: 4,
      y: 9,
      tone: "light"
    },
    {
      x: 5,
      y: 9,
      tone: "light"
    }
  ]
]
