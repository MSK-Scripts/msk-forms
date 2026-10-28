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
  Archive as ArchiveBase,
  ArrowClockwise as ArrowClockwiseBase,
  ArrowCounterClockwise as ArrowCounterClockwiseBase,
  ArrowLeft as ArrowLeftBase,
  ArrowRight as ArrowRightBase,
  ArrowSquareOut as ArrowSquareOutBase,
  CalendarBlank as CalendarBlankBase,
  CaretDown as CaretDownBase,
  CaretLeft as CaretLeftBase,
  CaretRight as CaretRightBase,
  CaretUp as CaretUpBase,
  CaretUpDown as CaretUpDownBase,
  ChartBar as ChartBarBase,
  ChatText as ChatTextBase,
  Check as CheckBase,
  CheckCircle as CheckCircleBase,
  CircleNotch as CircleNotchBase,
  ClipboardText as ClipboardTextBase,
  Clock as ClockBase,
  ClockCounterClockwise as ClockCounterClockwiseBase,
  Copy as CopyBase,
  DotsThree as DotsThreeBase,
  DownloadSimple as DownloadSimpleBase,
  Eye as EyeBase,
  Flag as FlagBase,
  FloppyDisk as FloppyDiskBase,
  FolderSimple as FolderSimpleBase,
  Globe as GlobeBase,
  HourglassMedium as HourglassMediumBase,
  Info as InfoBase,
  Kanban as KanbanBase,
  Key as KeyBase,
  List as ListBase,
  Lock as LockBase,
  MagnifyingGlass as MagnifyingGlassBase,
  Minus as MinusBase,
  Monitor as MonitorBase,
  Moon as MoonBase,
  PaintBrush as PaintBrushBase,
  PaperPlaneTilt as PaperPlaneTiltBase,
  PencilSimple as PencilSimpleBase,
  Plus as PlusBase,
  QrCode as QrCodeBase,
  Robot as RobotBase,
  SignIn as SignInBase,
  SignOut as SignOutBase,
  Sparkle as SparkleBase,
  SquaresFour as SquaresFourBase,
  Star as StarBase,
  Sun as SunBase,
  Trash as TrashBase,
  Tray as TrayBase,
  TrendDown as TrendDownBase,
  TrendUp as TrendUpBase,
  UploadSimple as UploadSimpleBase,
  User as UserBase,
  UsersThree as UsersThreeBase,
  Warning as WarningBase,
  WarningCircle as WarningCircleBase,
  WebhooksLogo as WebhooksLogoBase,
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

export const Archive = decorative(ArchiveBase);
export const ArrowClockwise = decorative(ArrowClockwiseBase);
export const ArrowCounterClockwise = decorative(ArrowCounterClockwiseBase);
export const ArrowLeft = decorative(ArrowLeftBase);
export const ArrowRight = decorative(ArrowRightBase);
export const ArrowSquareOut = decorative(ArrowSquareOutBase);
export const CalendarBlank = decorative(CalendarBlankBase);
export const CaretDown = decorative(CaretDownBase);
export const CaretLeft = decorative(CaretLeftBase);
export const CaretRight = decorative(CaretRightBase);
export const CaretUp = decorative(CaretUpBase);
export const CaretUpDown = decorative(CaretUpDownBase);
export const ChartBar = decorative(ChartBarBase);
export const ChatText = decorative(ChatTextBase);
export const Check = decorative(CheckBase);
export const CheckCircle = decorative(CheckCircleBase);
export const CircleNotch = decorative(CircleNotchBase);
export const ClipboardText = decorative(ClipboardTextBase);
export const Clock = decorative(ClockBase);
export const ClockCounterClockwise = decorative(ClockCounterClockwiseBase);
export const Copy = decorative(CopyBase);
export const DotsThree = decorative(DotsThreeBase);
export const DownloadSimple = decorative(DownloadSimpleBase);
export const Eye = decorative(EyeBase);
export const Flag = decorative(FlagBase);
export const FloppyDisk = decorative(FloppyDiskBase);
export const FolderSimple = decorative(FolderSimpleBase);
export const Globe = decorative(GlobeBase);
export const HourglassMedium = decorative(HourglassMediumBase);
export const Info = decorative(InfoBase);
export const Kanban = decorative(KanbanBase);
export const Key = decorative(KeyBase);
export const List = decorative(ListBase);
export const Lock = decorative(LockBase);
export const MagnifyingGlass = decorative(MagnifyingGlassBase);
export const Minus = decorative(MinusBase);
export const Monitor = decorative(MonitorBase);
export const Moon = decorative(MoonBase);
export const PaintBrush = decorative(PaintBrushBase);
export const PaperPlaneTilt = decorative(PaperPlaneTiltBase);
export const PencilSimple = decorative(PencilSimpleBase);
export const Plus = decorative(PlusBase);
export const QrCode = decorative(QrCodeBase);
export const Robot = decorative(RobotBase);
export const SignIn = decorative(SignInBase);
export const SignOut = decorative(SignOutBase);
export const Sparkle = decorative(SparkleBase);
export const SquaresFour = decorative(SquaresFourBase);
export const Star = decorative(StarBase);
export const Sun = decorative(SunBase);
export const Trash = decorative(TrashBase);
export const Tray = decorative(TrayBase);
export const TrendDown = decorative(TrendDownBase);
export const TrendUp = decorative(TrendUpBase);
export const UploadSimple = decorative(UploadSimpleBase);
export const User = decorative(UserBase);
export const UsersThree = decorative(UsersThreeBase);
export const Warning = decorative(WarningBase);
export const WarningCircle = decorative(WarningCircleBase);
export const WebhooksLogo = decorative(WebhooksLogoBase);
export const X = decorative(XBase);
export const XCircle = decorative(XCircleBase);
