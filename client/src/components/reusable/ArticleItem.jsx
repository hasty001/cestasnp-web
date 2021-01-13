import React, { useContext } from 'react';
import * as Constants from '../Constants'; 
import UserLabel from './UserLabel';
import { dateTimeToStr } from '../../helpers/helpers';
import { AuthContext } from '../AuthContext';
import { A } from './Navigate';

const ArticleItem = (props) => {
  const authData = useContext(AuthContext);
  
  const ItemElement = props.tableRow ? `tr` : `div`;
  const ItemProp = props.tableRow ? `td` : `span`;
  const space = props.tableRow ? null : ` `;

  return (
    <ItemElement key={props.value._id} className="article-item">
      {!!props.value.errorMsg && <div className="errorMsg">{props.value.errorMsg}</div>}
      {!!props.value.successMsg && <div className="successMsg">{props.value.successMsg}</div>}

      {!!props.showCreated && <><ItemProp className="article-created">{dateTimeToStr(props.value.created)}</ItemProp>{space}<ItemProp><UserLabel uid={props.value.created_by} name={props.value.created_by_name}/></ItemProp></>}
      {!!props.showLastChange && (props.value.modified ? 
          <><ItemProp className="article-modified">{dateTimeToStr(props.value.modified)}</ItemProp>{space}<ItemProp>upravil</ItemProp>{space}<ItemProp><UserLabel uid={props.value.modified_by} name={props.value.modified_by_name}/>{space}</ItemProp></>
          : (props.showCreated ? <ItemProp colSpan={3}/> : <><ItemProp className="article-created">{dateTimeToStr(props.value.created)}</ItemProp>{space}<ItemProp>pridal</ItemProp>{space}<ItemProp><UserLabel uid={props.value.created_by} name={props.value.created_by_name}/>{space}</ItemProp></>))}
      <ItemProp className={"article-title"}>
        <A href={`/pred/articles/article/${props.value.sql_article_id}`}>
          {props.value.title}
        </A>
      </ItemProp>
      {space}
      <ItemProp className="article-actions">
        {!!authData.isAuth && props.my && props.onMyRemove &&
          (<a href="#" onClick={(e) => { e.preventDefault(); props.onMyRemove(props.value); }} className="article-my" title="odobrať z mojich člankov"><i className="fas fa-star"/></a>)}
      </ItemProp>
    </ItemElement>
  )
}

export default ArticleItem;