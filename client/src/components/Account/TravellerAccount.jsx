import React, { useState } from 'react';
import differenceInDays from 'date-fns/difference_in_days';
import { logDev } from '../../helpers/logDev';
import { fetchPostJsonWithToken } from '../../helpers/fetchUtils';
import * as Texts from '../Texts';
import * as Constants from '../Constants';
import FormWithLoader from '../reusable/FormWithLoader';
import FormText from '../reusable/FormText';
import FormTextArea from '../reusable/FormTextArea';
import { useStateEx } from '../../helpers/reactUtils';
import FormSelect from '../reusable/FormSelect';
import PageWithLoader from '../reusable/PageWithLoader';
import { format } from 'date-fns';
import { parseDate } from '../../helpers/helpers';
import { A } from '../reusable/Navigate';

const TravellerAccount = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearMsg = () => {
    setError('');
    setSuccess('');
  }

  const isDuklaDevin = props.userData.travellerDetails.start_miesto == 'Dukla' || 
    props.userData.travellerDetails.start_miesto == 'Devín';

  const [name, setName] = useStateEx(props.edit ? props.userData.travellerDetails.meno : '', clearMsg);
  const [text, setText] = useStateEx(props.edit ? props.userData.travellerDetails.text : '', clearMsg);
  const [start, setStart] = useStateEx(props.edit ?
    (isDuklaDevin ? props.userData.travellerDetails.start_miesto : 'oth') : 'Dukla', clearMsg);
  const [startOther, setStartOther] = useStateEx(props.edit && !isDuklaDevin ? props.userData.travellerDetails.start_miesto : '', clearMsg);
  const [startDate, setStartDate] = useStateEx(props.edit ? props.userData.travellerDetails.start_date : '', clearMsg);
  const [count, setCount] = useStateEx(props.edit ? (props.userData.travellerDetails.number || '0').toString() : '', clearMsg);

  const getState = () => props.edit ? (props.userData.travellerDetails.cancelled ? 'cancelled' 
    : (props.userData.travellerDetails.finishedTracking ? 'finished' : 'ok')) : 'ok';

  // for edit only
  const [state, setState] = useStateEx(getState(), clearMsg);
  const [endDate, setEndDate] = useStateEx(props.edit ? props.userData.travellerDetails.end_date : '', clearMsg);
  const [completed, setCompleted] = useStateEx(props.edit ? (props.userData.travellerDetails.completed ? '1' : '') : '', clearMsg);

  const createTraveller = () => {
    if (props.edit) {
      if (
        name === props.userData.travellerDetails.meno &&
        text === props.userData.travellerDetails.text &&
        (start === props.userData.travellerDetails.start_miesto ||
         startOther === props.userData.travellerDetails.start_miesto) &&
        count == props.userData.travellerDetails.number &&
        startDate === props.userData.travellerDetails.start_date &&
        state === getState() &&
        endDate === props.userData.travellerDetails.end_date &&
        !!completed == !!props.userData.travellerDetails.completed
      ) {
        setError('Nič si nezmenil');
        return;
      }
    }

    if (!name || name.trim().length === 0) {
      setError('Zabudol si na názov cesty!');
      return;
    }

    if (!text || text.trim().length === 0) {
      setError('Zabudol si na popis!');
      return;
    }

    if (text.trim().length < 32) {
      setError('Popis cesty je príliš krátky (min. 32 znakov)!');
      return;
    }

    if (start === 'oth' &&
      (!startOther || startOther.trim().length === 0)
    ) {
      setError('Zabudol si na alternatívny začiatok, kedže nevyrážaš ani z Dukly ani z Devína!');
      return;
    }

    if (!startDate || startDate.trim().length === 0) {
      setError('Zabudol si na dátum začiatku cesty!');
      return;
    }

    if (count == null || count.trim().length === 0 || parseInt(count) < 0) {
      setError('Počet účasníkov nesmie byť záporný!');
      return;
    }

    const sStartDate = parseDate(startDate);
    logDev(sStartDate);
    if (format(sStartDate, 'YYYY-MM-DD') != props.userData.travellerDetails.start_date
      && differenceInDays(sStartDate, new Date()) < -5) {
      logDev(differenceInDays(sStartDate, new Date()));
      
      setError('Začiatok cesty je viac než 5 dni v minulosti. Vyber iný dátum alebo ho nemeň!');
      return;
    }

    var sEndDate = '';
    if (props.edit && state == "finished") {
      if (!endDate || endDate.trim().length === 0) {
        setError('Zabudol si na dátum ukončenia cesty!');
        return;
      }

      sEndDate = parseDate(endDate);
      if (differenceInDays(sEndDate, sStartDate) < 0) {
        setError('Koniec cesty je skôr ako jej začiatok. Vyber iný dátum!');
        return;
      }
    }

    setLoading(true);
    clearMsg();

    const data = {
      meno: name,
      text: text,
      start_date: format(sStartDate, 'YYYY-MM-DD'),
      uid: props.userData.userDetails.uid,
      start_miesto: start === 'oth' ? startOther : start,
      number: parseInt(count),
      end_date: sEndDate ? format(sEndDate, 'YYYY-MM-DD') : (props.userData.travellerDetails.end_date || ''),
      completed: !!completed,
      email: 0,
      finishedTracking: state == "finished" || state == "cancelled",
      cancelled: state == "cancelled",
      finishedManual: state == "finished" || state == "cancelled"
    };

    fetchPostJsonWithToken(props.userData.user, 
      props.edit ? '/api/traveller/updateTraveller' : '/api/traveller/setupTraveller', data)
    .then(travellerDetails => {
      if (travellerDetails.error) {
        throw travellerDetails.error;
      }
      
      props.userData.updateTravellerDetails(travellerDetails);
      setSuccess('Detaily tvojej cesty sme úspešne zmenili');
    })
    .catch(e => {
      console.error('TravellerAccount error', e);

      setError(Texts.GenericError);
    })
    .finally(() => setLoading(false));
  }

  return (
    <PageWithLoader pageId="TravellerAccount" pageTitle={`Moja cesta${Constants.WebTitleSuffix}`}>
      <FormWithLoader
        className="fanAccountWrap"
        loading={loading} error={error} success={success}
        submitText={props.edit ? "Uložiť zmeny" : "Vytvoriť cestu"} onSubmit={createTraveller}>

        {props.edit ? (
        <>
          <h2>Moja cesta</h2>
          <p>
            Tu si môžeš upraviť detaily <A href={`/na/${props.userData.userDetails.uid}`}>tvojej cesty</A>:
          </p>
        </>)
        : (
        <>
          <h2>Chystáš sa na cestu?</h2>
          <p>
            Prečítaj si ako používať LIVE Sledovanie popísané v{' '}
            <a href="/pred/articles/article/10004" target="_blank">
              tomto návode
            </a>{' '}
            a vytvor si profil!{' '}
          </p>
          <p>Potom stačí už len vyraziť :).</p>
        </>)}

        <FormText valueName="name" valueLabel="Názov tvojej cesty" value={[name, setName]}
          inputAttrs={{ maxLength: "30", placeholder: "(max. 30 znakov)" }} />

        <FormTextArea valueName="text" valueLabel="O tvojej skupine alebo putovaní" value={[text, setText]}
          inputAttrs={{ placeholder: "(min. 32 znakov)" }} />

        <FormSelect valueName="start" valueLabel="Kde štartuješ/te?" value={[start, setStart]}
          options={[{ value: "Dukla", label: "Dukla" }, { value: "Devín", label: "Devín" },
            { value: "oth", label: "Inde" }]} 
          labelChildren={start === 'oth' && <FormText valueName="startOther" valueLabel="" value={[startOther, setStartOther]} inputAttrs={{ placeholder: "Kde?" }} />}/>

        <FormText valueName="count" valueLabel="Koľko vás ide? (0 ak nechceš uviesť)" value={[count, setCount]}
          inputAttrs={{ type: "number" }} />

        <FormText valueName="startDate" valueLabel="Kedy vyrážaš/te?" value={[startDate, setStartDate]}
          inputAttrs={{ type: "date" }} />

        {!!props.edit && (
        <>
          <br/>
          <FormSelect valueName="state" valueLabel="Aký je stav tvojej cesty?" value={[state, setState]}
            options={[{ value: "ok", label: "plánovaná/aktivná" }, { value: "finished", label: "dokončená" },
              { value: "cancelled", label: "zrušená" }]} 
            labelChildren={state === 'finished' && (
            <>
              <FormText valueName="endDate" valueLabel="Kedy si cestu dokončil?" value={[endDate, setEndDate]}
                inputAttrs={{ type: "date" }} />

              <FormSelect valueName="completed" valueLabel="Koľko cesty si ušiel?" value={[completed, setCompleted]}
                options={[{ value: "1", label: "celú" }, { value: "", label: "časť" }]} />
            </>)}/>
        </>)}

        {!props.edit && (
        <p>
          Nezabudni si ale pozrieť{' '}
          <a href="/pred/articles/article/10004" target="_blank">
            návod
          </a>
          .
        </p>)}
      </FormWithLoader>
    </PageWithLoader>
  );
}

export default TravellerAccount;
