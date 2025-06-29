
import React from "react";

type CountrySelectorProps = {
  countries: string[];
  selected: string;
  onSelect: (country: string) => void;
};

const CountrySelector: React.FC<CountrySelectorProps> = ({
  countries,
  selected,
  onSelect,
}) => {
  const handleCountryClick = (country: string) => {
    console.log('Country clicked:', country);
    console.log('Previously selected:', selected);
    onSelect(country);
  };

  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-[#343a4d] mb-6 px-4 py-3">
      <h3 className="text-lg font-semibold text-white mb-2">Select Channel</h3>
      <div className="flex flex-wrap gap-2">
        {countries.map(country => (
          <button
            key={country}
            onClick={() => handleCountryClick(country)}
            onTouchEnd={() => handleCountryClick(country)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors touch-manipulation ${
              selected === country
                ? "bg-[#ff5a36] border-[#ff5a36] text-white"
                : "bg-[#232738] border-[#343a4d] text-gray-200 hover:bg-[#242836] hover:border-[#ff5a36] active:bg-[#242836]"
            }`}
            type="button"
          >
            {country}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CountrySelector;
