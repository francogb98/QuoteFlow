interface Props {
  children: React.ReactNode;
}

export const FilterGrid = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col md:flex-row gap-4">{children}</div>;
};
