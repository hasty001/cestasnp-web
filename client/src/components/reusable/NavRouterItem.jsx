import { NavItem } from "react-bootstrap";
import { navigate } from "./Navigate";

/**
 * Extended NavItem to use router for navigation, set href property.
 */
class NavRouterItem extends NavItem {
  constructor(props) {
    super(props);

    this.superHandleClick = super.handleClick;

    this.handleClick = this.handleClickOverride.bind(this);
  }

  handleClickOverride (event) {
    navigate(event);

    if (event.defaultPrevented) {
      this.superHandleClick(event);
    }
  }
}

export default NavRouterItem;