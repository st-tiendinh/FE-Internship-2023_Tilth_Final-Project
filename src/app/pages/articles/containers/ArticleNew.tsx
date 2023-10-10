import { useState } from 'react';

import EditorForm from './components/EditorForm';
import { PostAction } from './components/EditorForm';
import { ScrollToTopButton } from '../../../shared/components';

const ArticleNew = () => {
  const [postData, setPostData] = useState<any>({});

  return (
    <div className="page-write-article">
      <div className="container">
        <div className="row">
          <div className="col col-9 col-md-12">
            <EditorForm
              type={PostAction.CREATE}
              postData={postData}
              setPostData={setPostData}
            />
          </div>
        </div>
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default ArticleNew;
