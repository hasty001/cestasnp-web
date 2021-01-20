import React, { useEffect, useReducer } from 'react';

export const LocalSettingsContext = React.createContext( {
  activeLink: {},
  setActiveLink: () => {}
} );

const activeKindReducer = (state, action) => {
  return { kind: action, href: action == "light" ? "/na/ceste/light" : (action == "fotky" ? "/na/ceste/fotky" : "/na/ceste") }};

export const LocalSettingsProvider = ({ children }) => {
  const settings = JSON.parse(localStorage.getItem("Settings")) || {};

  const [activeLink, setActiveLink] = useReducer(activeKindReducer, activeKindReducer(null, settings["activeKind"]));

  useEffect(() => {
    localStorage.setItem("Settings", JSON.stringify({ activeKind: activeLink.kind }));
  }, [activeLink]);

  return (
    <LocalSettingsContext.Provider
      value={{
        activeLink,
        setActiveLink,
      }}
    >
      {children}
    </LocalSettingsContext.Provider>
  );
};

export const LocalSettingsConsumer = LocalSettingsContext.Consumer;
