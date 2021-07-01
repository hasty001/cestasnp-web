import React, { useEffect, useState } from 'react';
import differenceInDays from 'date-fns/difference_in_days';
import { logDev } from '../../helpers/logDev';
import { fetchPostJsonWithToken } from '../../helpers/fetchUtils';
import * as Texts from '../Texts';
import * as Constants from '../Constants';
import FormWithLoader from '../reusable/FormWithLoader';
import FormText from '../reusable/FormText';
import FormCheckBox from '../reusable/FormCheckBox';
import FormTextArea from '../reusable/FormTextArea';
import { useStateEx, useStateProp } from '../../helpers/reactUtils';
import FormSelect from '../reusable/FormSelect';
import PageWithLoader from '../reusable/PageWithLoader';
import { format } from 'date-fns';
import { parseDate } from '../../helpers/helpers';
import { A } from '../reusable/Navigate';
import ConfirmBox from '../reusable/ConfirmBox';
import { clear } from 'memory-cache';
import FindBuddiesWarning from '../reusable/FindBuddiesWarning';

const EditFindBuddies = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const clearMsg = () => {
    setError('');
    setSuccess('');
  }

  const [findBuddies, setFindBuddies] = useState(props.userData && Object.keys(props.userData.findBuddies).length > 0 ? 
    props.userData.findBuddies : null);

  useEffect(
    () => setFindBuddies(props.userData && Object.keys(props.userData.findBuddies).length > 0 ? 
      props.userData.findBuddies : null), [props.userData.findBuddies]);

  const isDuklaDevin = findBuddies ? (findBuddies.start_miesto == 'Dukla' || 
    findBuddies.start_miesto == 'Devín') : false;
  const isEndDuklaDevin = findBuddies ? (findBuddies.end_miesto == 'Dukla' || 
    findBuddies.end_miesto == 'Devín') : false;

  const [enabled, setEnabled] = useStateEx(findBuddies ? findBuddies.enabled : true, clearMsg);
  const [showEmail, setShowEmail] = useStateEx(findBuddies ? findBuddies.showEmail : false, clearMsg);
  const [showComments, setShowComments] = useStateEx(findBuddies ? findBuddies.showComments : true, clearMsg);
  const [text, setText] = useStateEx(findBuddies ? findBuddies.text : '', clearMsg);
  const [start, setStart] = useStateEx(findBuddies && findBuddies.start_miesto ? 
    (isDuklaDevin ? findBuddies.start_miesto : 'oth') : 'Dukla', clearMsg);
  const [startOther, setStartOther] = useStateEx(findBuddies && !isDuklaDevin ? findBuddies.start_miesto : '', clearMsg);
  
  const [startDate, setStartDate] = useStateEx(findBuddies ? findBuddies.start_date : '', clearMsg);
  
  const [end, setEnd] = useStateEx(findBuddies && findBuddies.end_miesto ? 
    (isEndDuklaDevin ? findBuddies.end_miesto : 'oth') : 'Devín', clearMsg);
  const [endOther, setEndOther] = useStateEx(findBuddies && !isEndDuklaDevin ? findBuddies.end_miesto : '', clearMsg);
  
  const clear = () => {
    setEnabled(true);
    setShowEmail(false);
    setShowComments(true);
    setText('');
    setStart('Dukla');
    setStartOther('');

    setStartDate('');

    setEnd('Devín');
    setEndOther('');
  }

  const save = () => {
    if (findBuddies && (
      enabled === findBuddies.enabled &&
      showEmail === findBuddies.showEmail &&
      showComments === findBuddies.showComments &&
      text === findBuddies.text &&
      (start === findBuddies.start_miesto ||
        startOther === findBuddies.start_miesto) &&
      (end === findBuddies.end_miesto ||
        endOther === findBuddies.end_miesto) &&
      startDate === findBuddies.start_date)
    ) {
      setError('Nič si nezmenil');
      return;
    }

    if (!text || text.trim().length === 0) {
      setError('Zabudol si na ďalšie informácie!');
      return;
    }

    if (start === 'oth' &&
      (!startOther || startOther.trim().length === 0)
    ) {
      setError('Zabudol si na alternatívny začiatok, kedže nevyrážaš ani z Dukly ani z Devína!');
      return;
    }

    if (!startDate || startDate.trim().length === 0) {
      setError('Zabudol si na približné dátum začiatku cesty!');
      return;
    }

    const sStartDate = parseDate(startDate);
    logDev(sStartDate);
    if (differenceInDays(sStartDate, new Date()) < 0) {
      logDev(differenceInDays(sStartDate, new Date()));
      
      setError('Začiatok cesty nesmie byť v minulosti. Vyber iný dátum!');
      return;
    }

    setLoading(true);
    clearMsg();

    const data = {
      enabled,
      text,
      showEmail,
      showComments,
      start_date: format(sStartDate, 'YYYY-MM-DD'),
      uid: props.userData.userDetails.uid,
      start_miesto: start === 'oth' ? startOther : start,
      end_miesto: end === 'oth' ? endOther : end,
    };

    fetchPostJsonWithToken(props.userData.user, '/api/traveller/updateFindBuddies', data)
    .then(result => {
      if (result.error) {
        throw result.error;
      }
      
      props.userData.updateFindBuddies(result);
      setSuccess('Nastavenie tvojho inzerátu sme úspešne zmenili');
    })
    .catch(e => {
      console.error('FindBuddies error', e);

      setError(Texts.GenericError);
    })
    .finally(() => setLoading(false));
  }

  const handleDelete = (confirmed) => {
    setShowConfirmDelete(false);

    if (!confirmed) {
      return;
    }

    setLoading(true);
    clearMsg();
    
    fetchPostJsonWithToken(props.userData.user, '/api/traveller/deleteFindBuddies', { uid: props.userData.userDetails.uid })
    .then(result => {
      if (result.error) {
        throw result.error;
      }
      
      props.userData.updateFindBuddies({});
      setFindBuddies(null);
      clear();
      setSuccess('Tvoj inzerát sme úspešne zmazali');
    })
    .catch(e => {
      console.error('FindBuddies delete error', e);

      setError(Texts.GenericError);
    })
    .finally(() => setLoading(false));
  }

  return (
    <PageWithLoader pageId="EditFindBuddies" pageTitle={`Hľadám parťákov - môj inzerát${Constants.WebTitleSuffix}`}>
      <FormWithLoader
        loading={loading} error={error} success={success}
        submitText={"Uložiť zmeny"} onSubmit={save} title={"Hľadám parťákov - môj inzerát"}
        description={(<p>
          <A href={`/pred/hladampartakov/${props.userData.userDetails.uid}`}>Tvoj inzerát</A> bude zverejnený na stránke <A href="/pred/hladampartakov">Hľadám parťákov</A> len 
          pre prihlásených užívateľov. Bude tam do dňa štartu vrátane alebo než ho skryješ či smažeš. 
        </p>)}
        buttons={!!findBuddies && (<button className="snpBtnWhite" 
          onClick={() => setShowConfirmDelete(true)} type="button">Zmazať a vytvoriť nový</button>)}>

        <FindBuddiesWarning/>

        <br/>
        <FormCheckBox itemClassName="form-checkbox" valueName="enabled" valueLabel="Zverejniť môj inzerát." value={[enabled, setEnabled]}/>
        <FormCheckBox itemClassName="form-checkbox" valueName="showComments" valueLabel="Povoliť záujemcom pridávať komentáre. Zobrazí sa ti jeho/jej email pre ďalšie kontaktovanie." value={[showComments, setShowComments]}/>
        <FormCheckBox itemClassName="form-checkbox" valueName="showEmail" 
          valueLabel={<span>(Neodporúčame) Zverejniť v inzeráte môj email <a href={`mailto:${props.userData.userDetails.email}`}>{props.userData.userDetails.email}</a>, cez ktorý ma budú môcť kontaktovať záujemcovia.</span>} value={[showEmail, setShowEmail]}/>
        <br/>

        <FormText valueName="startDate" valueLabel="Kedy približne plánuješ vyráziť?" value={[startDate, setStartDate]}
          inputAttrs={{ type: "date" }} itemClassName="form"/>

        <FormSelect valueName="start" valueLabel="Kde chceš štartovať?" value={[start, setStart]} itemClassName="form"
          options={[{ value: "Dukla", label: "Dukla" }, { value: "Devín", label: "Devín" },
            { value: "oth", label: "Inde" }]} 
          labelChildren={start === 'oth' && <FormText valueName="startOther" valueLabel="" value={[startOther, setStartOther]} inputAttrs={{ placeholder: "Kde?" }} itemClassName="form"/>}/>
        
        <FormSelect valueName="end" valueLabel="Kam chceš dôjsť?" value={[end, setEnd]} itemClassName="form"
          options={[{ value: "Devín", label: "Devín" }, { value: "Dukla", label: "Dukla" },
            { value: "oth", label: "Inam" }]} 
          labelChildren={end === 'oth' && <FormText valueName="endOther" valueLabel="" value={[endOther, setEndOther]} inputAttrs={{ placeholder: "Kam?" }} itemClassName="form"/>}/>

        <br/>
        <FormTextArea valueName="text" valueLabel="Ďalšie informácie (tvoj plán, o tebe, kto sa môže pridať, ...)" value={[text, setText]} itemClassName="form"/>

        <ConfirmBox
            title="Zmazať inzerát"
            text="Naozaj chcete zmazať tento inzerát, vrátane prípadných komentárov?"
            confirmText="Zmazať"
            show={showConfirmDelete}
            onConfirm={() => handleDelete(true)}
            onHide={() => handleDelete(false)}
          />
      </FormWithLoader>
    </PageWithLoader>
  );
}

export default EditFindBuddies;
