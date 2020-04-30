import React from 'react';
import { Link, Breadcrumb, BreadcrumbsWrapper, Table, Text, Row, Column, Spinner, Input, Card, Heading, Icon } from 'design-system';
import { useHistory } from 'react-router-dom';
import query from '../query';
import { useQuery } from '@apollo/react-hooks';
import './Stats.css';
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
  Bar,
  Line,
  ResponsiveContainer
} from 'recharts';
const { useEffect, useState } = React;

const columnOptions = {
  size: '12',
  sizeXL: '6',
  sizeL: '12',
  sizeM: '6',
  sizeS: '6'
};

const WorldStats = (props) => {
  const { entity, queryType } = props;
  let history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleDrill = (id) => {
    history.push(`/${entity}/detail/${id}`);
  };

  const onResetSearch = () => {
    setSearchQuery('');
  }

  const schema = [
    {
      width: 200,
      pinned: false ? 'LEFT' : undefined,
      template: ({ x, rowIndex }) => (
        <div className="Stat-table-cell">
          <Link onClick={() => handleDrill(x)}>{x}</Link>
        </div>
      ),
      get: ({ name, state }) => ({
        x: entity === 'india' ? state : name
      }),
      header: () => (
        <div className="Stat-table-cell">
          <Text weight="strong">Name</Text>
        </div>
      )
    },
    {
      width: 100,
      pinned: false ? 'LEFT' : undefined,
      template: ({ x, rowIndex }) => <div className="Stat-table-cell">{x}</div>,
      get: ({ mostRecent, confirmed }) => ({
        x: entity === 'india' ? confirmed : mostRecent.confirmed
      }),
      header: () => (
        <div className="Stat-table-cell">
          <Text weight="strong">Confirmed</Text>
        </div>
      )
    },
    {
      width: 100,
      pinned: false ? 'LEFT' : undefined,
      template: ({ x, rowIndex }) => <div className="Stat-table-cell">{x}</div>,
      get: ({ mostRecent, recovered }) => ({
        x: entity === 'india' ? recovered : mostRecent.recovered
      }),
      header: () => (
        <div className="Stat-table-cell">
          <Text weight="strong">Recovered</Text>
        </div>
      )
    },
    {
      width: 100,
      pinned: false ? 'LEFT' : undefined,
      template: ({ x, rowIndex }) => <div className="Stat-table-cell">{x}</div>,
      get: ({ mostRecent, deaths }) => ({
        x: entity === 'india' ? deaths : mostRecent.deaths
      }),
      header: () => (
        <div className="Stat-table-cell">
          <Text weight="strong">Deaths</Text>
        </div>
      )
    }
  ];

  const getData = (entity, data = {}) => {
    const list = entity === 'india' ? data.india.statewise : data.countries;
    if (!list) return [];
    return list
      .filter((item) => {
        if (entity === 'india') {
          return item.state.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 && item.state !== 'Total';
        }
        return item.name.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1;
      })
      .map((item) => {
        if (entity === 'india') {
          return {
            ...item,
            ...{
              name: item.state,
              recovered: Number(item.recovered),
              deaths: Number(item.deaths),
              confirmed: Number(item.confirmed)
            }
          };
        }
        return item;
      });
  };

  const { loading, error, data } = useQuery(query[queryType]);

  return (
    <div className="Stats-container">
      <header className="Stats-header">
        <BreadcrumbsWrapper heading='World Statistics'>
          <Breadcrumb>
            <div className="Breadcrumb-link">
              <Link onClick={() => history.push('/')}>HOME</Link>
            </div>
          </Breadcrumb>
        </BreadcrumbsWrapper>
      </header>

      {error && <div>error...</div>}

      {!error && !loading && data && (
        <div className="Stats-body">
          <Row>
            <Column {...columnOptions}>
              <div style={{ height: '100%', padding: '8px', boxSizing: 'border-box' }}>
                <Card
                  shadow="medium"
                  style={{
                    padding: '16px',
                    backgroundColor: 'white',
                    height: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <div className="Stats-heading" style={{ marginBottom: '12px' }}>
                    <Heading size="m">Countries</Heading>
                  </div>
                  <Row>
                    <Input
                      clearButton={true}
                      value={searchQuery}
                      icon="search"
                      name="input"
                      placeholder="Search"
                      onChange={(ev) => handleSearch(ev.target.value)}
                      onClear={() => handleSearch('')}
                      info="Search on name"
                    />
                  </Row>
                  <div style={{ marginTop: '16px' }}>
                    <Table
                      style={{
                        maxHeight: 'calc(100vh - 300px)'
                      }}
                      loadMore={() => null}
                      loading={loading}
                      loadingMoreData={false}
                      getGridActions={false ? undefined : undefined}
                      buffer={5}
                      dynamicRowHeight={false}
                      rowHeight={50}
                      headerHeight={40}
                      virtualization={false}
                      schema={schema}
                      pagination={true}
                      data={getData(entity, data)}
                    />
                  </div>
                  {/* </Row> */}
                </Card>
              </div>
            </Column>
            <Column {...columnOptions}>
              <div style={{ height: '100%', padding: '8px', alignItems: 'center' }}>
                <Card
                  shadow="medium"
                  style={{
                    padding: '16px',
                    backgroundColor: 'white'
                  }}
                >
                  <div className="Stats-heading" style={{ marginBottom: '21px' }}>
                    <Heading size="m">Country-wise Statistics</Heading>
                    <Icon name="autorenew" appearance="subtle" size="24" onClick={onResetSearch} />
                  </div>
                  {loading && (
                    <div className="Spinner-container">
                      <Spinner size="large" appearance="primary" />
                    </div>
                  )}
                  {!loading && data && (
                    <ResponsiveContainer width={'100%'} height={250}>
                      <ComposedChart data={getData(entity, data)}>
                        <XAxis dataKey={entity === 'india' ? 'state' : 'name'} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <CartesianGrid stroke="#f5f5f5" />
                        <Area
                          name="Recovered"
                          type="monotone"
                          dataKey={entity === 'india' ? 'recovered' : 'mostRecent[recovered]'}
                          fill="#71c077"
                          stroke="#2ea843"
                        />
                        <Bar
                          name="Confirmed"
                          barSize={20}
                          dataKey={entity === 'india' ? 'confirmed' : 'mostRecent[confirmed]'}
                          fill="#0070dd"
                        />
                        <Line
                          name="Deaths"
                          type="monotone"
                          dataKey={entity === 'india' ? 'deaths' : 'mostRecent[deaths]'}
                          stroke="#d93737"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </div>
            </Column>
          </Row>
        </div>
      )}
    </div>
  );
};

export default WorldStats;
