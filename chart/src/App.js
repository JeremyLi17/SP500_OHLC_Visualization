import { useState } from 'react';
import styled from 'styled-components';
import ReactECharts from 'echarts-for-react';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const UploadWrapper = styled.div`
  width: 100%;
`;

const UploadContainer = styled.form`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
`;

const File = styled.input`
  display: flex;
`;

const Button = styled.button`
  display: flex;
`;

const ChartContainer = styled.div`
  width: 100%;
`;

const Info = styled.div`
  font-size: 34px;
  align-items: center;
  justify-content: center;
  display: flex;
  padding: 20px;
  width: 100%;
`;

const upColor = '#00da3c';
const downColor = '#ec0000';

function App() {
  const [csvFile, setCsvFile] = useState();
  const [dateArray, setDateArray] = useState([]);
  const [ohlcArray, setOhlcArray] = useState([]);
  const [MA50Array, setMA50Array] = useState([]);
  const [MA200Array, setMA200Array] = useState([]);

  // submit file
  const submitFile = () => {
    const file = csvFile;
    const reader = new FileReader();

    reader.onload = function (e) {
      const text = e.target.result;
      processCSV(text);
    };

    reader.readAsText(file);
  };

  // process raw data
  const processCSV = (str, delim = ',') => {
    const headers = str.slice(0, str.indexOf('\n')).split(delim);
    const rows = str.slice(str.indexOf('\n') + 1).split('\n');
    const jsonArray = rows.map((row) => {
      const values = row.trim().split(delim);
      const eachObject = headers.reduce((obj, header, i) => {
        obj[header.trim()] = values[i];
        return obj;
      }, {});
      return eachObject;
    });

    const dates = [];
    const ohlcData = [];
    const ma50 = [];
    const ma200 = [];

    for (let i = 0; i < jsonArray.length; i++) {
      dates.push(jsonArray[i].Date);
      ohlcData.push([
        jsonArray[i].Open,
        jsonArray[i].Close,
        jsonArray[i].Low,
        jsonArray[i].High,
      ]);
      ma50.push(jsonArray[i].MA50);
      ma200.push(jsonArray[i].MA200);
    }

    setDateArray(dates);
    setOhlcArray(ohlcData);
    setMA50Array(ma50);
    setMA200Array(ma200);
  };

  // OHLC style
  function renderItem(params, api) {
    var xValue = api.value(0);
    var openPoint = api.coord([xValue, api.value(1)]);
    var closePoint = api.coord([xValue, api.value(2)]);
    var lowPoint = api.coord([xValue, api.value(3)]);
    var highPoint = api.coord([xValue, api.value(4)]);
    var halfWidth = api.size([1, 0])[0] * 0.35;
    var style = api.style({
      // stroke: api.visual('color'),
      stroke: '#2c2c2c',
    });
    return {
      type: 'group',
      children: [
        {
          type: 'line',
          shape: {
            x1: lowPoint[0],
            y1: lowPoint[1],
            x2: highPoint[0],
            y2: highPoint[1],
          },
          style: style,
        },
        {
          type: 'line',
          shape: {
            x1: openPoint[0],
            y1: openPoint[1],
            x2: openPoint[0] - halfWidth,
            y2: openPoint[1],
          },
          style: style,
        },
        {
          type: 'line',
          shape: {
            x1: closePoint[0],
            y1: closePoint[1],
            x2: closePoint[0] + halfWidth,
            y2: closePoint[1],
          },
          style: style,
        },
      ],
    };
  }

  const option = {
    animation: false,
    title: {
      text: 'S&P 500 Index',
      subtext: '2021.3. - 2023.3',
      left: 'center',
    },
    legend: {
      bottom: 10,
      left: 'center',
      data: ['S&P500 Candlestick', 'MA50', 'MA200', 'S&P500 OHLC'],
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      textStyle: {
        color: '#000',
      },
      position: function (pos, params, el, elRect, size) {
        const obj = {
          top: 10,
        };
        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
        return obj;
      },
    },
    axisPointer: {
      link: [
        {
          xAxisIndex: 'all',
        },
      ],
      label: {
        backgroundColor: '#777',
      },
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: false,
        },
        brush: {
          type: ['lineX', 'clear'],
        },
      },
    },
    brush: {
      xAxisIndex: 'all',
      brushLink: 'all',
      outOfBrush: {
        colorAlpha: 0.1,
      },
    },
    visualMap: {
      show: false,
      seriesIndex: 5,
      dimension: 2,
      pieces: [
        {
          value: 1,
          color: downColor,
        },
        {
          value: -1,
          color: upColor,
        },
      ],
    },
    grid: [
      {
        left: '10%',
        right: '8%',
        height: '40%',
      },
      {
        left: '10%',
        right: '8%',
        top: '50%',
        height: '40%',
      },
    ],
    xAxis: [
      {
        type: 'category',
        data: dateArray,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
        axisPointer: {
          z: 100,
        },
      },
      {
        type: 'category',
        data: dateArray,
        gridIndex: 1,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
        axisPointer: {
          z: 100,
        },
      },
    ],
    yAxis: [
      {
        scale: true,
        splitArea: {
          show: true,
        },
      },
      {
        scale: true,
        gridIndex: 1,
        splitArea: {
          show: true,
        },
      },
      // {
      //   scale: true,
      //   gridIndex: 1,
      //   splitNumber: 2,
      //   axisLabel: { show: false },
      //   axisLine: { show: false },
      //   axisTick: { show: false },
      //   splitLine: { show: false },
      // },
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 98,
        end: 100,
      },
      {
        show: true,
        xAxisIndex: [0, 1],
        type: 'slider',
        top: '93%',
        start: 98,
        end: 100,
      },
    ],
    series: [
      {
        name: 'S&P500 Candlestick',
        type: 'candlestick',
        data: ohlcArray,
        itemStyle: {
          color: upColor,
          color0: downColor,
          borderColor: undefined,
          borderColor0: undefined,
        },
      },
      {
        name: 'MA50',
        type: 'line',
        data: MA50Array,
        smooth: true,
        lineStyle: {
          opacity: 0.5,
        },
      },
      {
        name: 'MA200',
        type: 'line',
        data: MA200Array,
        smooth: true,
        lineStyle: {
          opacity: 0.5,
        },
      },
      {
        name: 'S&P500 OHLC',
        type: 'custom',
        xAxisIndex: 1,
        yAxisIndex: 1,
        renderItem: renderItem,
        dimensions: ['-', 'open', 'close', 'lowest', 'highest'],
        encode: {
          x: 0,
          y: [1, 2, 3, 4],
          tooltip: [1, 2, 3, 4],
        },
        data: ohlcArray.map((e, i) => {
          return [i, ...e];
        }),
      },
    ],
  };

  const action = {
    type: 'brush',
  };

  return (
    <Wrapper>
      <UploadWrapper>
        <UploadContainer id="csv-form">
          <File
            type="file"
            accept=".csv"
            id="csvFile"
            onChange={(e) => {
              setCsvFile(e.target.files[0]);
            }}
          ></File>
          <br />
          <Button
            onClick={(e) => {
              e.preventDefault();
              if (csvFile) submitFile();
            }}
          >
            Submit
          </Button>
        </UploadContainer>
      </UploadWrapper>
      <ChartContainer>
        {dateArray.length !== 0 ? (
          <ReactECharts
            option={option}
            action={action}
            style={{ height: '90vh', padding: '20px 0px' }}
          />
        ) : (
          <Info>Please upload data file first</Info>
        )}
      </ChartContainer>
    </Wrapper>
  );
}

export default App;
