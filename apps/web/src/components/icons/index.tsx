/**
 * The one place icons come from: Phosphor, regular weight, through its SSR
 * build so the same import works in server and client components.
 *
 * Every icon is decorative by default (aria-hidden, not focusable). Give one
 * an aria-label or aria-labelledby and it is announced instead.
 *
 * Only the icons listed here end up in the bundle, and the list holds only
 * icons something imports. A new one is added to the import and the export
 * list below, in alphabetical order; one that loses its last import goes.
 * Brand marks (Discord, GitHub) stay local SVG in their original shape, not
 * Phosphor's redrawn versions.
 *
 * Tabler (`@tabler/icons-react`) is still used by the existing pages and
 * leaves when they are restyled; new code imports from here only.
 */
import type { Icon, IconProps } from "@phosphor-icons/react";
import {
  ArrowClockwise as ArrowClockwiseBase,
  ArrowLeft as ArrowLeftBase,
  ArrowRight as ArrowRightBase,
  ArrowSquareOut as ArrowSquareOutBase,
  CalendarBlank as CalendarBlankBase,
  CaretDown as CaretDownBase,
  CaretLeft as CaretLeftBase,
  CaretRight as CaretRightBase,
  CaretUp as CaretUpBase,
  CaretUpDown as CaretUpDownBase,
  Check as CheckBase,
  CheckCircle as CheckCircleBase,
  CircleNotch as CircleNotchBase,
  Clock as ClockBase,
  Copy as CopyBase,
  DotsThree as DotsThreeBase,
  FloppyDisk as FloppyDiskBase,
  Globe as GlobeBase,
  HourglassMedium as HourglassMediumBase,
  Info as InfoBase,
  List as ListBase,
  Lock as LockBase,
  MagnifyingGlass as MagnifyingGlassBase,
  Minus as MinusBase,
  Monitor as MonitorBase,
  Moon as MoonBase,
  Plus as PlusBase,
  SignIn as SignInBase,
  SignOut as SignOutBase,
  Sparkle as SparkleBase,
  Star as StarBase,
  Sun as SunBase,
  TrendDown as TrendDownBase,
  TrendUp as TrendUpBase,
  UploadSimple as UploadSimpleBase,
  User as UserBase,
  UsersThree as UsersThreeBase,
  Warning as WarningBase,
  WarningCircle as WarningCircleBase,
  X as XBase,
  XCircle as XCircleBase,
} from "@phosphor-icons/react/ssr";
import { forwardRef } from "react";

export type IconComponent = Icon;

function decorative(Base: Icon): Icon {
  const Decorative = forwardRef<SVGSVGElement, IconProps>(function Decorative(props, ref) {
    const labelled = props["aria-label"] != null || props["aria-labelledby"] != null;
    return <Base ref={ref} aria-hidden={labelled ? undefined : true} focusable="false" {...props} />;
  });
  Decorative.displayName = Base.displayName;
  return Decorative;
}

export const ArrowClockwise = decorative(ArrowClockwiseBase);
export const ArrowLeft = decorative(ArrowLeftBase);
export const ArrowRight = decorative(ArrowRightBase);
export const ArrowSquareOut = decorative(ArrowSquareOutBase);
export const CalendarBlank = decorative(CalendarBlankBase);
export const CaretDown = decorative(CaretDownBase);
export const CaretLeft = decorative(CaretLeftBase);
export const CaretRight = decorative(CaretRightBase);
export const CaretUp = decorative(CaretUpBase);
export const CaretUpDown = decorative(CaretUpDownBase);
export const Check = decorative(CheckBase);
export const CheckCircle = decorative(CheckCircleBase);
export const CircleNotch = decorative(CircleNotchBase);
export const Clock = decorative(ClockBase);
export const Copy = decorative(CopyBase);
export const DotsThree = decorative(DotsThreeBase);
export const FloppyDisk = decorative(FloppyDiskBase);
export const Globe = decorative(GlobeBase);
export const HourglassMedium = decorative(HourglassMediumBase);
export const Info = decorative(InfoBase);
export const List = decorative(ListBase);
export const Lock = decorative(LockBase);
export const MagnifyingGlass = decorative(MagnifyingGlassBase);
export const Minus = decorative(MinusBase);
export const Monitor = decorative(MonitorBase);
export const Moon = decorative(MoonBase);
export const Plus = decorative(PlusBase);
export const SignIn = decorative(SignInBase);
export const SignOut = decorative(SignOutBase);
export const Sparkle = decorative(SparkleBase);
export const Star = decorative(StarBase);
export const Sun = decorative(SunBase);
export const TrendDown = decorative(TrendDownBase);
export const TrendUp = decorative(TrendUpBase);
export const UploadSimple = decorative(UploadSimpleBase);
export const User = decorative(UserBase);
export const UsersThree = decorative(UsersThreeBase);
export const Warning = decorative(WarningBase);
export const WarningCircle = decorative(WarningCircleBase);
export const X = decorative(XBase);
export const XCircle = decorative(XCircleBase);
