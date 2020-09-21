export interface PageInstance{
  onPullDownRefresh?(): void
  onReachBottom?(): void
  onPageScroll?(obj: { scrollTop: number }): void
  onTabItemTap?(obj: { index: string, pagePath: string, text: string }): void
}
