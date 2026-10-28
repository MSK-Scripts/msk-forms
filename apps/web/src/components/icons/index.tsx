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
 */
import type { Icon, IconProps } from "@phosphor-icons/react";
import {
  Archive as ArchiveBase,
  ArrowClockwise as ArrowClockwiseBase,
  ArrowCounterClockwise as ArrowCounterClockwiseBase,
  ArrowDown as ArrowDownBase,
  ArrowLeft as ArrowLeftBase,
  ArrowRight as ArrowRightBase,
  ArrowSquareOut as ArrowSquareOutBase,
  ArrowUp as ArrowUpBase,
  CalendarBlank as CalendarBlankBase,
  CaretCircleDown as CaretCircleDownBase,
  CaretDown as CaretDownBase,
  CaretLeft as CaretLeftBase,
  CaretRight as CaretRightBase,
  CaretUp as CaretUpBase,
  CaretUpDown as CaretUpDownBase,
  ChartBar as ChartBarBase,
  ChatText as ChatTextBase,
  Check as CheckBase,
  CheckCircle as CheckCircleBase,
  CheckSquare as CheckSquareBase,
  CircleNotch as CircleNotchBase,
  ClipboardText as ClipboardTextBase,
  Clock as ClockBase,
  ClockCounterClockwise as ClockCounterClockwiseBase,
  Copy as CopyBase,
  DotsThree as DotsThreeBase,
  DownloadSimple as DownloadSimpleBase,
  EnvelopeSimple as EnvelopeSimpleBase,
  Eye as EyeBase,
  EyeSlash as EyeSlashBase,
  Flag as FlagBase,
  FloppyDisk as FloppyDiskBase,
  FolderSimple as FolderSimpleBase,
  Gauge as GaugeBase,
  Globe as GlobeBase,
  Hash as HashBase,
  HourglassMedium as HourglassMediumBase,
  ImageSquare as ImageSquareBase,
  Info as InfoBase,
  Kanban as KanbanBase,
  Key as KeyBase,
  LinkSimple as LinkSimpleBase,
  List as ListBase,
  ListBullets as ListBulletsBase,
  Lock as LockBase,
  MagnifyingGlass as MagnifyingGlassBase,
  MathOperations as MathOperationsBase,
  Minus as MinusBase,
  Monitor as MonitorBase,
  Moon as MoonBase,
  PaintBrush as PaintBrushBase,
  Paperclip as PaperclipBase,
  PaperPlaneTilt as PaperPlaneTiltBase,
  Paragraph as ParagraphBase,
  Pause as PauseBase,
  PencilSimple as PencilSimpleBase,
  Phone as PhoneBase,
  Play as PlayBase,
  Plus as PlusBase,
  QrCode as QrCodeBase,
  RadioButton as RadioButtonBase,
  Robot as RobotBase,
  SealCheck as SealCheckBase,
  Signature as SignatureBase,
  SignIn as SignInBase,
  SignOut as SignOutBase,
  SlidersHorizontal as SlidersHorizontalBase,
  Smiley as SmileyBase,
  Sparkle as SparkleBase,
  SquaresFour as SquaresFourBase,
  Star as StarBase,
  Sun as SunBase,
  Table as TableBase,
  TextAlignLeft as TextAlignLeftBase,
  Textbox as TextboxBase,
  TextH as TextHBase,
  TextT as TextTBase,
  ToggleRight as ToggleRightBase,
  Trash as TrashBase,
  Tray as TrayBase,
  TrendDown as TrendDownBase,
  TrendUp as TrendUpBase,
  UploadSimple as UploadSimpleBase,
  User as UserBase,
  UserPlus as UserPlusBase,
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
    return (
      <Base ref={ref} aria-hidden={labelled ? undefined : true} focusable="false" {...props} />
    );
  });
  Decorative.displayName = Base.displayName;
  return Decorative;
}

export const Archive = decorative(ArchiveBase);
export const ArrowClockwise = decorative(ArrowClockwiseBase);
export const ArrowCounterClockwise = decorative(ArrowCounterClockwiseBase);
export const ArrowDown = decorative(ArrowDownBase);
export const ArrowLeft = decorative(ArrowLeftBase);
export const ArrowRight = decorative(ArrowRightBase);
export const ArrowSquareOut = decorative(ArrowSquareOutBase);
export const ArrowUp = decorative(ArrowUpBase);
export const CalendarBlank = decorative(CalendarBlankBase);
export const CaretCircleDown = decorative(CaretCircleDownBase);
export const CaretDown = decorative(CaretDownBase);
export const CaretLeft = decorative(CaretLeftBase);
export const CaretRight = decorative(CaretRightBase);
export const CaretUp = decorative(CaretUpBase);
export const CaretUpDown = decorative(CaretUpDownBase);
export const ChartBar = decorative(ChartBarBase);
export const ChatText = decorative(ChatTextBase);
export const Check = decorative(CheckBase);
export const CheckCircle = decorative(CheckCircleBase);
export const CheckSquare = decorative(CheckSquareBase);
export const CircleNotch = decorative(CircleNotchBase);
export const ClipboardText = decorative(ClipboardTextBase);
export const Clock = decorative(ClockBase);
export const ClockCounterClockwise = decorative(ClockCounterClockwiseBase);
export const Copy = decorative(CopyBase);
export const DotsThree = decorative(DotsThreeBase);
export const DownloadSimple = decorative(DownloadSimpleBase);
export const EnvelopeSimple = decorative(EnvelopeSimpleBase);
export const Eye = decorative(EyeBase);
export const EyeSlash = decorative(EyeSlashBase);
export const Flag = decorative(FlagBase);
export const FloppyDisk = decorative(FloppyDiskBase);
export const FolderSimple = decorative(FolderSimpleBase);
export const Gauge = decorative(GaugeBase);
export const Globe = decorative(GlobeBase);
export const Hash = decorative(HashBase);
export const HourglassMedium = decorative(HourglassMediumBase);
export const ImageSquare = decorative(ImageSquareBase);
export const Info = decorative(InfoBase);
export const Kanban = decorative(KanbanBase);
export const Key = decorative(KeyBase);
export const LinkSimple = decorative(LinkSimpleBase);
export const List = decorative(ListBase);
export const ListBullets = decorative(ListBulletsBase);
export const Lock = decorative(LockBase);
export const MagnifyingGlass = decorative(MagnifyingGlassBase);
export const MathOperations = decorative(MathOperationsBase);
export const Minus = decorative(MinusBase);
export const Monitor = decorative(MonitorBase);
export const Moon = decorative(MoonBase);
export const PaintBrush = decorative(PaintBrushBase);
export const Paperclip = decorative(PaperclipBase);
export const PaperPlaneTilt = decorative(PaperPlaneTiltBase);
export const Paragraph = decorative(ParagraphBase);
export const Pause = decorative(PauseBase);
export const PencilSimple = decorative(PencilSimpleBase);
export const Phone = decorative(PhoneBase);
export const Play = decorative(PlayBase);
export const Plus = decorative(PlusBase);
export const QrCode = decorative(QrCodeBase);
export const RadioButton = decorative(RadioButtonBase);
export const Robot = decorative(RobotBase);
export const SealCheck = decorative(SealCheckBase);
export const Signature = decorative(SignatureBase);
export const SignIn = decorative(SignInBase);
export const SignOut = decorative(SignOutBase);
export const SlidersHorizontal = decorative(SlidersHorizontalBase);
export const Smiley = decorative(SmileyBase);
export const Sparkle = decorative(SparkleBase);
export const SquaresFour = decorative(SquaresFourBase);
export const Star = decorative(StarBase);
export const Sun = decorative(SunBase);
export const Table = decorative(TableBase);
export const TextAlignLeft = decorative(TextAlignLeftBase);
export const Textbox = decorative(TextboxBase);
export const TextH = decorative(TextHBase);
export const TextT = decorative(TextTBase);
export const ToggleRight = decorative(ToggleRightBase);
export const Trash = decorative(TrashBase);
export const Tray = decorative(TrayBase);
export const TrendDown = decorative(TrendDownBase);
export const TrendUp = decorative(TrendUpBase);
export const UploadSimple = decorative(UploadSimpleBase);
export const User = decorative(UserBase);
export const UserPlus = decorative(UserPlusBase);
export const UsersThree = decorative(UsersThreeBase);
export const Warning = decorative(WarningBase);
export const WarningCircle = decorative(WarningCircleBase);
export const WebhooksLogo = decorative(WebhooksLogoBase);
export const X = decorative(XBase);
export const XCircle = decorative(XCircleBase);
