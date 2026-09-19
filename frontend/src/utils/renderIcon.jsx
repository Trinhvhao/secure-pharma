/**
 * renderIcon — Chấp nhận CẢ HAI dạng khi truyền icon prop:
 *
 *   1. JSX element đã render sẵn (đúng kiểu React)
 *      <MyComponent icon={<Pill size={20} />} />
 *
 *   2. Component chưa render (function/class) — sẽ tự wrap với size mặc định
 *      <MyComponent icon={Pill} />
 *
 * Lý do: rất nhiều page trong project lỡ truyền `icon={Pill}` thay vì
 * `icon={<Pill/>}`. Nếu render trực tiếp `{icon}`, React sẽ báo:
 *   "Objects are not valid as a React child (found: object with keys {$$typeof, render})"
 *
 * Helper này detect: nếu là React element → trả về nguyên xi; nếu là component
 * (function/class) → wrap với size mặc định 20.
 *
 * @param {React.ReactNode|React.ComponentType} icon
 * @param {number} [defaultSize=20]
 * @returns {React.ReactNode|null}
 */
export function renderIcon(icon, defaultSize = 20) {
    if (!icon) return null;

    // Đã là JSX element (có $$typeof) → trả nguyên
    if (typeof icon === 'object' && icon !== null && '$$typeof' in icon) {
        return icon;
    }

    // Là function/class component → wrap với size mặc định
    if (typeof icon === 'function') {
        const IconComponent = icon;
        return <IconComponent size={defaultSize} aria-hidden="true" />;
    }

    // Là string (emoji, ký tự) → render nguyên
    return icon;
}
