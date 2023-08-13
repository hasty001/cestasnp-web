import React, { useContext, useEffect, useState } from 'react';
import DocumentTitle from 'react-document-title';
import * as Constants from '../Constants';
import * as Texts from '../Texts';
import { dateTimeToStr, getArticleStateIcon } from '../../helpers/helpers';
import { AuthContext } from '../AuthContext';
import { fetchJson, fetchPostJsonWithToken } from '../../helpers/fetchUtils';
import PageWithLoader from '../reusable/PageWithLoader';
import FormSelect from '../reusable/FormSelect';
import { A } from '../reusable/Navigate';
import UserLabel from '../reusable/UserLabel';
import { addDays, addMonths, addYears, startOfToday } from 'date-fns';
import PaginationAdvanced from '../PaginationAdvanced';
import FormCheckBox from '../reusable/FormCheckBox';
import { useStateWithLocalStorage } from '../../helpers/reactUtils';

const Changes = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);
  const [items, setItems] = useStateWithLocalStorage("ChangesTableItems", '');
  const [from, setFrom] = useStateWithLocalStorage("ChangesTableFrom", 1);
  const [to, setTo] = useState(null);
  const [my, setMy] = useStateWithLocalStorage("ChangesTableMy", true);
  const [page, setPage] = useState(0);
  
  const authData = useContext(AuthContext);

  const fromValues = [
    0,
    addDays(startOfToday(), -7).toISOString(),
    addMonths(startOfToday(), -1).toISOString(),
    addYears(startOfToday(), -1).toISOString(),
  ];

  const fetchData = () => {
    setLoading(true);
    setError('');

    fetchPostJsonWithToken(authData.user, '/api/changes', { uid: authData.userDetails.uid, from: fromValues[from], to, my, page, items })
      .then(data => {
        setData(data);
        setLoading(false);
        setError('');
      })
      .catch(e => {
        setLoading(false);
        setError(Texts.GenericError);

        console.error("Changes data loading error: ", e);
      });
  };

  useEffect(() => { fetchData(); }, [from, to, my, page, items]);

  const getTableAsText = (table) => {
    switch (table) {
      case "pois":
      case "pois_history":
        return "dôležité miesto";
      case "articles":
      case "articles_history":
        return "článok";
      case "traveler_details":
        return "cesta";
      case "traveler_messages":
        return "správa";
      case "traveler_comments":
      case "article_comments":
        return "komentár";
      case "find_buddies_comments":
        return "odpoved na hľadanie parťakov";
      case "traveler_find_buddies":
        return "hľadanie parťakov";
      default:
        return table;
    }
  }
  
  const getChangeText = (change, item) => {
    switch (change) {
      case "created":
        return item.state == -1 ? "navrhol pridať" : "pridal";
      case "modified":
        return item.state == -1 ? "navrhol úpravy" : "upravil";
      case "deleted":
        return "zmazal";
      default:
        return table;
    }
  }

  return (
    <PageWithLoader pageId="Changes" loading={loading} error={error}>
      {!!data && (
        <>
          <DocumentTitle title={`Prehľad zmien${Constants.WebTitleSuffix}`} />
          
          <h2>Prehľad zmien</h2>
 
          <FormSelect value={[items, setItems]} 
            valueLabel="Typ:" valueName="items" itemClassName="form" 
            options={[{ value: "", label: "vše" }, 
              { value: "pois,articles,details", label: "dôležité miesta, články a cesty" }, { value: "details,messages,comments", label: "cesty, správy a komentáre" },
              { value: "buddies,answers", label: "hľadanie parťakov a odpovede" },
              { value: "pois", label: "dôležité miesta" }, { value: "articles", label: "články" }, { value: "details", label: "cesty" },
              { value: "messages", label: "správy" }, { value: "comments", label: "komentáre" }, 
              { value: "buddies", label: "hľadanie parťakov" },
              { value: "answers", label: "odpovede na hľadanie parťakov" },
            ]}/>
          
          <FormSelect value={[from, setFrom]} 
            valueLabel="Obdobie:" valueName="from" itemClassName="form" 
            options={[ 
            { value: 1, label: "posledných 7 dní" },
            { value: 2, label: "posledný mesíc" },
            { value: 3, label: "posledný rok" },
            { value: 0, label: "vše" } ]}/>

          <FormCheckBox value={[my, setMy]} valueName="my" valueLabel="len moje" itemClassName="form" />

          <PaginationAdvanced className="top"
            pages={data ? Math.ceil(data.count / 20) : 0}
            activePage={page + 1}
            handlePageSelect={p => setPage(p - 1)}
          />

          <table className="changes-table">
          <thead>
            <tr>
              <th>Čas</th>
              <th>Zmena</th>
              <th>Uživatel</th>
              <th>Typ</th>
              <th>Meno</th>
              <th>Poznámka</th>
            </tr>
          </thead>
          <tbody>
            {!!data && data.items.map((item, i) => 
              <tr key={i}>
                <td>{dateTimeToStr(item.date)}</td>
                <td>{getChangeText(item.change, item.item)}</td>
                <td><UserLabel uid={item.user} name={item.userName}/></td>
                <td>{getTableAsText(item.table)}</td>
                <td><A href={item.url}>{item.name}</A></td>
                <td>{item.note}</td>
              </tr>)}
          </tbody>
        </table>

        <PaginationAdvanced
          pages={data ? Math.ceil(data.count / 20) : 0}
          activePage={page + 1}
          handlePageSelect={p => setPage(p - 1)}
        />
      
        </>
      )}
    </PageWithLoader>
  );
}

export default Changes;
