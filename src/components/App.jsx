import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { batch } from "react-redux";
import { YMaps } from "@pbe/react-yandex-maps";
import axios from "axios";
import { setTheme, setStateInterval } from "../store/uiSlice";
import { setData, setFutureData, setTime } from "../store/weatherDataSlice";
import { apiKeys, currentWeatherUrl, currentTimeUrl } from "../helpers/url";
import { setBackground } from "../helpers/bgColors";
import { setSity } from "../helpers/setCity";
// Импорт компонентов
import Menu from "./Menu";
import RenderSearchItem from "./RenderSearchItem";
import Parent from "./Parent";
import Header from "./Header";
import Temperature from "./Temperature";
import Icons from "./Icons";
import Sunrise from "./Sunrise";
import Main from "./Main";
import TodayTemp from "./TodayTemp";
import ForecastContainer from "./ForecastContainer";
import ForecastListContainer from "./ForecastListContainer";
import Forecast from "./Forecast";
import DescContainer from "./DescContainer";
import Desc from "./Desc";
import Footer from "./Footer";
import YandexMap from "./YandexMap";

// Импорт необходимых action creators для обновления состояния
import { setFullLocation } from "../store/locationSlice";

const App = () => {
  // Инициализация useDispatch для дальнейшего диспатча экшенов
  const dispatch = useDispatch();

  // Получение данных из состояния Redux с помощью useSelector
  const { data } = useSelector((state) => state.weatherData);

  const { unit, forecastTime, stateInterval } = useSelector(
    (state) => state.ui
  );
  const { fullLocation } = useSelector((state) => state.location);

  // Обработчик изменения темы
  const handleSetTheme = (theme) => {
    dispatch(setTheme(theme));
  };

  // useEffect для обработки запросов при загрузке компонента
  useEffect(() => {
    // Функция для отправки запросов на получение данных о погоде и времени
    const getRequest = async (defaultCity, currentLocation) => {
      const { apiKey, reserveApiKey } = apiKeys;
      // Определение местоположения запроса (текущее или по умолчанию)
      const requestLocation =
        currentLocation.length === 0 ? defaultCity : currentLocation;
      const currLoc = setSity(defaultCity, currentLocation, localStorage.getItem('city'));
      console.log(currLoc)
      try {
        // Запрос данных о текущей погоде и прогнозе на будущее
        const request = await axios.get(
          currentWeatherUrl("weather", requestLocation, apiKey, unit)
        );
        const future = await axios.get(
          currentWeatherUrl("forecast", requestLocation, apiKey, unit)
        );

        // Используем batch для оптимизации диспатча нескольких экшенов
        batch(() => {
          dispatch(setData(request.data)); // Обновление текущих данных о погоде
          dispatch(setFutureData(future.data)); // Обновление данных прогноза
          dispatch(setFullLocation(requestLocation)); // Обновление местоположения
        });
      } catch (e) {
        if (e.message === "Request failed with status code 429") {
          // Обработка ошибки 429 (слишком много запросов)
          const requestReserve = await axios.get(
            currentWeatherUrl("weather", requestLocation, reserveApiKey, unit)
          );
          const futureReserve = await axios.get(
            currentWeatherUrl("forecast", requestLocation, reserveApiKey, unit)
          );

          // Используем batch для оптимизации диспатча нескольких экшенов
          batch(() => {
            dispatch(setData(requestReserve.data)); // Обновление текущих данных о погоде (резервные данные)
            dispatch(setFutureData(futureReserve.data)); // Обновление данных прогноза (резервные данные)
            dispatch(setFullLocation(requestLocation)); // Обновление местоположения
          });
        }
      }
    };

    // Вызов функции для получения данных о погоде при монтировании компонента
    getRequest("Казань", fullLocation);

    // Установка интервала для периодического обновления данных о погоде
    const intervalFunc = setInterval(() => {
      getRequest("Казань", fullLocation);
      dispatch(setStateInterval()); // Увеличение значения stateInterval
    }, 60000); // Интервал обновления - каждую минуту

    // Очистка интервала при размонтировании компонента
    return () => clearInterval(intervalFunc);
  }, [unit, forecastTime, fullLocation, stateInterval]);

  // useEffect для получения данных о времени
  useEffect(() => {
    const getTimeData = async () => {
      const { timeApiKey, reserveTimeApiKey } = apiKeys;

      if (data.length !== 0) {
        const { lat, lon } = data.coord;
        try {
          // Запрос данных о текущем времени
          const getTime = await axios.get(currentTimeUrl(timeApiKey, lat, lon));

          // Используем batch для оптимизации диспатча нескольких экшенов
          batch(() => {
            dispatch(setTime(getTime.data)); // Обновление данных о текущем времени
            setBackground(getTime.data, handleSetTheme); // Установка фона в зависимости от времени
          });
        } catch (e) {
          if (e.message === "Request failed with status code 429") {
            // Обработка ошибки 429 (слишком много запросов) для резервного API
            const getTime = await axios.get(
              currentTimeUrl(reserveTimeApiKey, lat, lon)
            );

            // Используем batch для оптимизации диспатча нескольких экшенов
            batch(() => {
              dispatch(setTime(getTime.data)); // Обновление данных о текущем времени (резервные данные)
              setBackground(getTime.data, handleSetTheme); // Установка фона в зависимости от времени (резервные данные)
            });
          }
        }
      }
    };

    // Вызов функции для получения данных о времени
    getTimeData();

    // Установка таймаута для периодического обновления данных о времени
    const timeout = setTimeout(() => {
      getTimeData();
    }, 60000); // Задержка обновления - 400 мс

    // Очистка таймаута при размонтировании компонента
    return () => clearTimeout(timeout);
  }, [data.coord, data.length]);

  return (
    <Parent>
      <Menu>
        <RenderSearchItem />
      </Menu>
      <Header />
      <Temperature>
        <Icons />
      </Temperature>
      <Main />
      <TodayTemp />
      <ForecastContainer>
        <ForecastListContainer>
          <Forecast />
        </ForecastListContainer>
      </ForecastContainer>
      <DescContainer>
        <Desc />
      </DescContainer>
      <Sunrise />
      <Footer>
        <YMaps>
          <YandexMap />
        </YMaps>
      </Footer>
    </Parent>
  );
};

export default App;
