export interface Book {
  book_id: number;
  book_code: string;
  book_name: string;
  author: string;
  cover_url: string;
  link: string;
}

export const books: Book[] = [
  {
    book_id: 1,
    book_code: "huozhe",
    book_name: "活着",
    author: "余华",
    cover_url: "/images/活着.jpg",
    link: "/card/huozhe"
  },
  {
    book_id: 2,
    book_code: "walden",
    book_name: "瓦尔登湖",
    author: "thoreau",
    cover_url: "/images/walden.svg",
    link: "/card/walden"
  },
  {
    book_id: 3,
    book_code: "xiyouji",
    book_name: "西游记",
    author: "吴承恩",
    cover_url: "/images/xiyouji.jpg",
    link: "/card/xiyouji"
  },
  {
    book_id: 4,
    book_code: "Call_to_Arms",
    book_name: "呐喊",
    author: "鲁迅",
    cover_url: "/images/nahan.jpg",
    link: "/card/Call_to_Arms"
  },
  {
    book_id: 5,
    book_code: "zhaohuaxishi",
    book_name: "朝花夕拾",
    author: "鲁迅",
    cover_url: "/images/zhaohuaxishi.jpg",
    link: "/card/zhaohuaxishi"
  },
  {
    book_id: 6,
    book_code: "Call_to_Arms",
    book_name: "彷徨",
    author: "鲁迅",
    cover_url: "/images/panghuang.jpg",
    link: "/card/Call_to_Arms"
  },
  {
    book_id: 7,
    book_code: "Call_to_Arms",
    book_name: "故事新编",
    author: "鲁迅",
    cover_url: "/images/故事新编.jpg",
    link: "/card/Call_to_Arms"
  },
  {
    book_id: 8,
    book_code: "chunan",
    book_name: "处男葛不垒",
    author: "徐皓峰",
    cover_url: "/images/chunangebulei.png",
    link: "/card/chunan"
  }
]; 