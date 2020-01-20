/* eslint-disable no-undef */
import React from "react";
import Enzyme, { shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import SearchResults from "../../src/Components/SearchResults";

Enzyme.configure({ adapter: new Adapter() });

describe("Search Results", () => {
  it("should render self and subcomponents", () => {
    const props = {
      currentSearchResults: [
        {
          properties: {
            name: "Test Name",
            code: "Test Code",
            country_code: "Test Country Code"
          }
        }
      ],
      processClickedResultHandler: jest.fn()
    };
    const wrapper = shallow(
      <SearchResults
          currentSearchResults={props.currentSearchResults}
          processClickedResultHandler={props.processClickedResultHandler} 
        />);
    );
    const navList = wrapper.find("WithStyles(ForwardRef(List))");
    const navItem = navList.find("WithStyles(ForwardRef(ListItemText))");
    expect(navItem.props().primary).toEqual(
      props.currentSearchResults[0].properties.name
    );
  });
});
