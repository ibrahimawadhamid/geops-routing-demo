import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Feature } from 'ol';
import { getLength } from 'ol/sphere';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Label } from 'recharts';
import { setIsRouteInfoOpen } from '../../store/actions/Map';
import Dialog from '../Dialog';
import './RouteInfosDialog.scss';

const propTypes = {
  route: PropTypes.instanceOf(Feature).isRequired,
};

const tickFormatter = (length, isMeter) => {
  let output;
  if (!isMeter) {
    output = `${Math.round((length / 1000) * 100) / 100}`;
  } else {
    output = `${Math.round(length * 100) / 100}`;
  }
  return output;
};

const everyNth = (arr, nth) => arr.filter((e, i) => i % nth === nth - 1);

function RouteInfosDialog({ route }) {
  const dispatch = useDispatch();

  const length = getLength(route.getGeometry());
  const distanceUnit = length > 100 ? 'km' : 'm';

  const altitudesArray = everyNth(route.getGeometry().getFlatCoordinates(), 3);
  const data = [];
  altitudesArray.forEach((alt, idx) => {
    data.push({
      alt,
      val: length * (idx / (altitudesArray.length - 1)),
    });
  });

  const ticks = [
    0,
    data[parseInt(altitudesArray.length * (2 / 4), 10)].val,
    length,
  ];

  return (
    <Dialog
      title={<span>Route information</span>}
      onClose={() => dispatch(setIsRouteInfoOpen(false))}
    >
      <LineChart width={400} height={200} data={data}>
        <YAxis axisLine={false} tickLine={false}>
          <Label value="m" offset={10} position="top" />
        </YAxis>
        <XAxis
          type="number"
          ticks={ticks}
          dataKey="val"
          tickFormatter={val => tickFormatter(val, distanceUnit === 'm')}
        >
          <Label value={distanceUnit} offset={10} position="right" />
        </XAxis>
        <CartesianGrid vertical={false} />
        <Line
          type="monotone"
          dataKey="alt"
          dot={false}
          stroke="#3f51b5"
          strokeWidth={2}
        />
      </LineChart>
    </Dialog>
  );
}

RouteInfosDialog.propTypes = propTypes;
export default RouteInfosDialog;
