import { useInfiniteQuery } from 'react-query';
import React, { useEffect, useRef, useState } from "react";
import MessageList from '../../components/MessageList/MessageList';
import config from '../../../config/env';
import styles from './zzz.module.css';


const fetchMessages = async (nextPage = 0) => {
    const { baseFetchUrl } = config;
    const response = await fetch(`${baseFetchUrl}/message/display?page=${nextPage}`);
    const data = await response.json();
    return data;
};

const ZZZ = () => {

    const { data, fetchNextPage, hasNextPage, isFetching} = useInfiniteQuery(
        'messages',
        ({pageParam = 0}) => fetchMessages(pageParam),
        {
            getNextPageParam: (lastPage) => {
                return lastPage.nextPage ? parseInt(lastPage.nextPage) : null
            }
        }
    );

    // `data` contient les messages récupérés jusqu'à présent

    // Déclenche le chargement des messages suivants lorsque l'utilisateur fait défiler la page
    // const handleScroll = () => {
    //     console.log('scroll')
    //     if (
    //         window.innerHeight + document.documentElement.scrollTop ===
    //         document.documentElement.offsetHeight
    //     ) {
    //         fetchNextPage();
    //     }
    // };

    // // Ajoutez un écouteur d'événement pour le scroll
    // useEffect(() => {
    //     window.addEventListener('scroll', handleScroll);
    //     return () => {
    //         window.removeEventListener('scroll', handleScroll);
    //     };
    // }, []);

    console.log({data, hasNextPage, isFetching})
    // Rendu des messages
    return (
        <>
            {data !== undefined &&
                <div>
                    {data.pages.map((page, pageIndex) => (
                        <React.Fragment key={pageIndex}>
                            <MessageList userMessages={page.messages} />
                        </React.Fragment>
                    ))}

                    {/* Affichez un indicateur de chargement si des messages sont en cours de chargement */}
                    {isFetching && <div>Loading...</div>}

                    {/* Affichez un indicateur de chargement lorsque les messages suivants sont disponibles */}
                    {hasNextPage && !isFetching && (
                        <button onClick={() => fetchNextPage()} disabled={isFetching}>
                            Load More
                        </button>
                    )}
                </div>
            }
        </>
    );
};

export default ZZZ;
