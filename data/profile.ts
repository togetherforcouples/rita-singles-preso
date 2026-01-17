/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { ProfileSection } from '../types';
import img1 from '@/images/S__5996550_0.jpg';
import img2 from '@/images/S__5996551_0.jpg';
import img3 from '@/images/S__5996552_0.jpg';
import img4 from '@/images/S__5996553_0.jpg';
import img5 from '@/images/S__5996554_0.jpg';
import img6 from '@/images/S__5996555_0.jpg';
import art1 from '@/images/art1.png';
import art2 from '@/images/art2.png';
import val1 from '@/images/val1.png';
import val2 from '@/images/val2.png';
import whyDate from '@/images/why_date.png';

export const PROFILE_DATA: Record<string, ProfileSection> = {
  'rita': {
    id: 'rita',
    title: 'About Rita',
    slides: [
      {
        title: "Who is She?",
        text: [
          "A creative designer living in Tokyo since Jan 2024.",
          "Hometown: Guangzhou",
          "She's 168cm tall and a native Chinese speaker who is fluent in English."
        ],
        imagePlaceholder: "Portrait of Rita",
        image: img6,
      },
      {
        title: "Funny Story",
        text: [
          "We met through Bouldering!",
          "Once she cried when she didn't manage to send her bouldering project.",
          "She's someone who works hard on her goals."
        ],
        image: img1,
      },
      {
        title: "Unpopular Opinion",
        text: [
          "\"We are not that important.\"",
          "A humble perspective that keeps her grounded."
        ],
        image: img2,
      }
    ]
  },
  'easel': {
    id: 'easel',
    title: 'Hobbies & Passions',
    slides: [
      {
        title: "The Artist",
        text: [
          "🎨 Drawing & Design are her core passions.",
          "She loves creating and exploring new aesthetics."
        ],
        imagePlaceholder: "Her Art Work",
        image: art1,
      },
      {
        title: "Digital Art",
        text: [
          "A showcase of her creative style.",
          "Where imagination meets the canvas."
        ],
        image: art2,
      },
    ]
  },
  'animated_fire': {
    id: 'animated_fire',
    title: 'Adventurer Hobbies',
    slides: [
      {
        title: "Adventurer Hobbies",
        text: [
          "🏂 Snowboarding (Her new obsession!)",
          "🧗‍♀️ Bouldering",
          "🚶‍♀️ Walking & Exploring Tokyo",
          "🍜 Hunting for new restaurants"
        ],
        image: img3,
      }
    ]
  },
  'notepad': {
    id: 'notepad',
    title: 'Why Date Rita?',
    slides: [
      {
        title: "Rita Partner Benefits",
        text: [
          "✅ Emotionally supportive partner.",
          "✅ Foodie Scout: No need to search for where to eat.",
          "✅ Human GPS: No need to look at the map."
        ],
        image: whyDate,
      },
      {
        title: "What She Looks For",
        text: [
          "✨ Humor",
          "🔥 Consistent Passion (for hobbies or goals)",
          "🧠 Independent Mind"
        ],
        image: img3,
      }
    ]
  },
  'bed': {
    id: 'bed',
    title: 'Core Values',
    slides: [
      {
        title: "What Matters Most",
        text: [
          "1. Curiosity: Always learning.",
          "2. Relax: Finding peace in the chaos.",
          "3. Adventure: Embracing the new."
        ],
        imagePlaceholder: "Cozy photo",
        image: val1,
      },
      {
        title: "Life Journey",
        text: [
          "Proudest Achievement: Leaving a well-paid job to move to Japan.",
          "It takes huge courage to reset your life for a dream."
        ],
        image: val2,
      }
    ]
  }
};