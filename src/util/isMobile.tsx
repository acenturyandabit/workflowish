import { isMobile as _isMobile } from 'react-device-detect';
export const isMobile = (): boolean => {
    return _isMobile || (localStorage.getItem("__polymorph_mobile_testing") == "true")
}