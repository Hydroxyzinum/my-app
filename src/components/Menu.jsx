import React, { useContext } from "react";
import axios from "axios";
import cn from "classnames";
import _ from "lodash";
import { apiKeys, currentWeatherUrl } from "../url";
import { Context } from "../context";
import { russia } from "../russia";

const MenuContainer = ({ value, children }) => {
  const {
    setData,
    setFutureData,
    setSearchEngine,
    setLocation,
    setFullLocation,
    setRightMenu,
    searchEngine,
    location,
    rightMenu,
    setUnit,
    unit,
  } = value;

  const formSubmit = async (e) => {
    e.preventDefault();

    const { apiKey, reserveApiKey } = apiKeys;

    const current = await axios.get(
      currentWeatherUrl("weather", location, apiKey, unit)
    );

    const future = await axios.get(
      currentWeatherUrl("forecast", location, apiKey, unit)
    );

    try {
      setData(current.data);
      setFutureData(future.data);
      setFullLocation(location);
      setUnit(unit);
      setRightMenu(false);
      setSearchEngine([]);
      setLocation("");
    } catch (e) {
      if (e.message === "Request failed with status code 404") {
        return setLocation("Не нашли :(");
      } else {
        const currentReserve = await axios.get(
          currentWeatherUrl("weather", location, reserveApiKey, unit)
        );

        const futureReserve = await axios.get(
          currentWeatherUrl("forecast", location, reserveApiKey, unit)
        );

        setData(currentReserve.data);
        setFutureData(futureReserve.data);
        setUnit(unit);
        setFullLocation(location);
        setRightMenu(false);
        setSearchEngine([]);
        setLocation("");
      }
    }
  };

  const inputChange = async (e) => {
    e.preventDefault();

    const { value } = e.target;

    if (!value) {
      setSearchEngine([]);
      setLocation("");
      return null;
    } else {
      setLocation(value);
      const result = russia.filter(({ city }) =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setSearchEngine(result);
    }
  };

  const classesblock = cn({
    "search-field": true,
    show: rightMenu,
  });

  const resultCn = cn({
    "search-result_container": true,
    "p-10": searchEngine.length >= 1 ? true : false,
  });

  return (
    <div className={classesblock}>
      <div className="сontrol-panel_block">
        <div className="panel-block">
          <button onClick={() => setRightMenu(false)} className="click-exit">
            <span className="exit-line exit-first_line"></span>
            <span className="exit-line exit-second_line"></span>
          </button>
          <label className="switch">
            <input
              onClick={(e) =>
                e.target.checked ? setUnit("imperial") : setUnit("metric")
              }
              type="checkbox"
            />
            <span className="slider round"></span>
            <span className="farenheit">F°</span>
            <span className="celsium">C°</span>
          </label>
        </div>
      </div>
      <div className="form-container">
        <form onSubmit={formSubmit} className="form-search">
          <label className="sr-only" htmlFor="search"></label>
          <input
            className="search-input"
            autoFocus
            onChange={inputChange}
            id="search"
            value={location}
            type="text"
            placeholder="Поиск"
            autoComplete="off"
          />
          <div className={resultCn}>
            <ul className="listSearch">{children}</ul>
          </div>
        </form>
      </div>
    </div>
  );
};

const RenderSearchItem = ({ value }) => {
  const { searchEngine, setLocation } = value;
  const memoSearchItem = React.useMemo(() => {
    if (searchEngine.length !== 0) {
      const newArr =
        searchEngine.length > 11 ? searchEngine.slice(0, 11) : searchEngine;
      return newArr.map(({ region, city }) => {
        return (
          <div key={_.uniqueId("city-")} className="buttons">
            <button
              onClick={() => setLocation(city)}
              type="submit"
              className="searchedItem"
            >
              {city ? city : null}{" "}
              <span className="region-name">({region ? region : null})</span>
            </button>
          </div>
        );
      });
    } else {
      return <div className="p-10">Ожидание запроса...</div>;
    }
  }, [searchEngine, setLocation]);
  return memoSearchItem;
};

const Menu = () => {
  const contextData = useContext(Context);
  return (
    <MenuContainer value={contextData}>
      <RenderSearchItem value={contextData}></RenderSearchItem>
    </MenuContainer>
  );
};

export default Menu;
