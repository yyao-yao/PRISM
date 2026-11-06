/** Display navigation only; static academic routes still come from content config. */
export const PRIMARY_NAVIGATION = [
  { id: 'home', title: 'Home', href: '/' },
  { id: 'about', title: 'About', href: '/about/' },
  { id: 'research', title: 'Research', href: '/publications/' },
  { id: 'teaching', title: 'Teaching', href: '/teaching/' },
  { id: 'cv', title: 'CV', href: '/cv/' },
  { id: 'photography', title: 'Photography', href: '/photography/' },
] as const;

export function getPrimaryNavigation(locale = 'en') {
  const titles = ['首页', '关于我', '研究', '教学', '简历', '摄影'];
  return PRIMARY_NAVIGATION.map((item, index) => ({
    ...item, title: locale.startsWith('zh') ? titles[index] : item.title,
  }));
}
