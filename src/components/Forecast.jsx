import React, { useContext, useMemo } from "react";
import { Context } from "../context";
import cn from "classnames";
import _ from "lodash";

const ForecastContainer = ({ children, value }) => {
  const { forecastTime, setForecastTime } = value;

  const submitForm = (e) => {
    e.preventDefault();
    setForecastTime(e.target.value);
  };

  return (
    <div className="forecast-container">
      <div className="forecast-header">
        <div className="forecast-head-container">
          <h4 className="forecast-head">5 Дней</h4>
        </div>
        <div className="select-container">
          <select
            className="select-time"
            value={forecastTime}
            onChange={submitForm}
            name="time"
          >
            <option className="option-style" value={9}>
              09:00
            </option>
            <option className="option-style" value={12}>
              12:00
            </option>
            <option className="option-style" value={15}>
              15:00
            </option>
            <option className="option-style" value={18}>
              18:00
            </option>
            <option className="option-style" value={21}>
              21:00
            </option>
          </select>
        </div>
      </div>
      {children}
    </div>
  );
};

const ForecastListContainer = ({ children }) => {
  return <div className="forecast-list_container">{children}</div>;
};

const ForecastList = ({ value }) => {
  const { list } = value.futureData;

  const { unit, forecastTime, theme } = value;

  const memoization = useMemo(() => {
    return list.map((item, index) => {
      const { dt_txt, clouds, main } = item;

      const { all } = clouds;

      const { temp_max, temp_min, humidity } = main;

      const averageTempAtNoon = new Date(dt_txt);

      const normalizeTempMax = Math.ceil(temp_max);

      const normalizeTempMin = Math.floor(temp_min);

      if (averageTempAtNoon.getHours() === Number(forecastTime)) {
        const { icon, description } = item.weather[0];

        const normalizeDesc = `${description[0].toUpperCase()}${description.slice(
          1
        )}`;

        const normalizeImgSrc = `${"weather/"}${icon}.png`;

        const currDate = new Date(item.dt_txt);

        const dayWeek = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

        const currentDay = dayWeek[currDate.getDay()];

        const progressCn =
          unit === "metric"
            ? cn({
                "progress-bar": true,
                "progress-bar-striped": true,
                "progress-bar-animated": true,
                "bg-info": normalizeTempMax <= 10 ? true : false,
                "bg-success": normalizeTempMax < 20 ? true : false,
                "bg-warning": normalizeTempMax >= 20 ? true : false,
                "bg-danger": normalizeTempMax >= 30 ? true : false,
              })
            : cn({
                "progress-bar": true,
                "progress-bar-striped": true,
                "progress-bar-animated": true,
                "bg-info": normalizeTempMax <= 50 ? true : false,
                "bg-success": normalizeTempMax <= 59 ? true : false,
                "bg-warning": normalizeTempMax >= 68 ? true : false,
                "bg-danger": normalizeTempMax >= 86 ? true : false,
              });

        const fahrenheitToCelsius = ((normalizeTempMax - 32) * 5) / 9;

        const progressStyles =
          unit === "metric" ? normalizeTempMax * 3 : fahrenheitToCelsius * 3;

        return (
          <div
            key={_.uniqueId("forecast-")}
            id={index}
            className="forecast-card"
          >
            <div className="front-inner">
              <div className="front">
                <p className="forecast-data">
                  {currentDay ? currentDay : null}
                </p>
                <img
                  className="forecast-data_img"
                  src={normalizeImgSrc}
                  alt={icon}
                />
                <div className="progress">
                  <div
                    className={progressCn}
                    style={{ width: `${progressStyles}%` }}
                    role="progressbar"
                    aria-valuenow={normalizeTempMax}
                    aria-valuemin="0"
                    aria-valuemax="40"
                  ></div>
                </div>
                <p className="forecast-temp">
                  {normalizeTempMax ? normalizeTempMax : null}°
                </p>
              </div>
              <div style={theme} className="back">
                <div className="back-time_container">
                  <p className="back-time">
                    {normalizeDesc ? normalizeDesc : null}
                  </p>
                  <img className="back-img" src={normalizeImgSrc} alt={icon} />
                </div>

                <div className="back-weather_info">
                  <div className="back-temp">
                    <span className="back-temp_min">
                      Макс.: {normalizeTempMax ? normalizeTempMax : null}°
                    </span>
                    <span className="back-temp_max">
                      Мин.: {normalizeTempMin ? normalizeTempMin : null}°
                    </span>
                  </div>
                  <div className="back-info">
                    <span className="back-clouds">
                      Облачность.: {all ? all : null}%
                    </span>
                    <span className="back-humidity">
                      Влажность.: {humidity ? humidity : null}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        return null;
      }
    });
  }, [forecastTime, list, theme, unit]);
  return memoization;
};

const Forecast = () => {
  const contextData = useContext(Context);
  return (
    <ForecastContainer value={contextData}>
      <ForecastListContainer>
        <ForecastList value={contextData}></ForecastList>
      </ForecastListContainer>
    </ForecastContainer>
  );
};

export default Forecast;
