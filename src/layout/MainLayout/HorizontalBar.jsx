import MenuList from './MenuList';

export default function HorizontalBar() {
  return (
    <div className="sticky top-[4.5rem] z-[1098] hidden min-h-14 items-center border-y border-slate-200 bg-white px-5 shadow-sm lg:flex">
      <MenuList />
    </div>
  );
}
