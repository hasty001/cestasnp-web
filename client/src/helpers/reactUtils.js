import { useEffect, useRef, useState } from "react"
import { logDev } from "./logDev";
import throttle from 'lodash/throttle';
import { json } from "body-parser";

/**
 * Uses prop state if it is in useState format [value, setValue], otherwise uses new local state with prop as initial value if set. 
 */
const useStateProp = (prop, defValue = undefined) => {
  if (typeof prop != "undefined") {
    if (prop && typeof prop == "object" && prop.length && prop.length == 2 && typeof prop[1] == "function") {
      return prop;
    } else {
      const [state, setState] = useState(prop);

      useEffect(() => { setState(prop); }, [prop]);

      return [state, setState];
    }
  } else {
    return useState(defValue);
  }
}

/**
 * Extended useState to pass callback function, which is called after state change.
 */
const useStateEx = (initial = undefined, callback = undefined) => {
  const [value, setValue] = useState(initial);

  return [value, callback ? ((v) => { setValue(v); callback();}) : setValue];
}

/**
 * Log changed props to console.
 */
const useTraceUpdate = (props) => {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0) {
      logDev('Changed props:', changedProps);
    }
    prev.current = props;
  });
}

const parse = (raw, defValue = null) => {
  try {
    return JSON.parse(raw);
  } catch (e) {
    return defValue;
  }
}

/**
 * Get and set prop state from local storage.
 */
const useStateWithLocalStorage = (key, defValue = null, callback = null) => {  
  const itemValue = key ? localStorage.getItem(key) : null;

  const [value, setValue] = useStateEx(itemValue == null ? defValue : parse(itemValue, defValue), callback);
 
  const save = throttle((k, v) => localStorage.setItem(k, JSON.stringify(v || defValue)), 1000);

  useEffect(() => {
    if (key) {
      save(key, value);
    }
  }, [value]);
 
  return [value, setValue];
};

/**
 * Get and set prop state from session storage.
 */
const useStateWithSessionStorage = (key, defValue = null, callback = null) => {  
  const [value, setValue] = useStateEx(defValue, callback);
 
  useEffect(() => {
    const itemValue = key ? sessionStorage.getItem(key) : null;
    setValue(itemValue == null ? defValue : parse(itemValue, defValue));
  }, [key]);

  const save = throttle((k, v) => sessionStorage.setItem(k, JSON.stringify(v || defValue)), 1000);

  useEffect(() => {
    if (key) {
      save(key, value);
    }
  }, [key, value]);
 
  return [value, setValue];
};


export { useStateProp, useStateEx, useStateWithLocalStorage, useStateWithSessionStorage, useTraceUpdate }