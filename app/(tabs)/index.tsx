import HomeMobile from "@/components/home/home-mobile";
import HomeWeb from "@/components/home/home-web";
import { useIsDesktopWeb } from "@/components/responsive";

/**
 * Home tab. Desktop web (≥ 1024px) gets the wide editorial page under the top
 * navigation bar; phones and narrow web get the phone layout.
 */
export default function Index() {
  const desktopWeb = useIsDesktopWeb();
  return desktopWeb ? <HomeWeb /> : <HomeMobile />;
}
