const BASE_CARD = 'ar_3:4,c_pad,b_white'

export function withCloudinaryTransform(url: string, transform: string): string {
  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  return url.slice(0, idx + marker.length) + transform + '/' + url.slice(idx + marker.length);
}

export function productCardImage(url: string): string {
  return withCloudinaryTransform(url, `${BASE_CARD},w_400,f_auto,q_auto,dpr_auto`);
}

export function cloudinarySrcSet(url: string, widths: number[] = [200, 400, 600, 800]): string {
  return widths
    .map(w => `${withCloudinaryTransform(url, `${BASE_CARD},w_${w},f_auto,q_auto,dpr_auto`)} ${w}w`)
    .join(', ');
}

export function cloudinaryThumbUrl(url: string): string {
  return withCloudinaryTransform(url, `${BASE_CARD},w_150,f_auto,q_auto,dpr_auto`);
}

export function blurPlaceholder(url: string): string {
  return withCloudinaryTransform(url, 'w_20,e_blur:1200,q_auto');
}
