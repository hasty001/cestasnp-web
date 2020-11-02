import { useEffect, useRef, useState } from "react"

/**
 * Uses prop state if it is in useState format [value, setValue], otherwise uses new local state with prop as initial value if set. 
 */
const useStateProp = (prop, defValue = undefined) => {
  if (typeof prop != "undefined") {
    if (prop && typeof prop == "object" && prop.length && prop.length == 2 && typeof prop[1] == "function") {
      return prop;
    } else {
      return useState(prop);
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
      console.log('Changed props:', changedProps);
    }
    prev.current = props;
  });
}

export { useStateProp, useStateEx, useTraceUpdate }